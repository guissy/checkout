import { createActor, SnapshotFrom } from "xstate";
import { prisma } from "@/lib/prisma";
import { EventEmitter } from "events";
import { PaymentEvent, paymentMachine } from "./paymentMachine";
import { updatePaymentStatusInDatabase } from "./payDb";
import { JsonObject } from "@prisma/client/runtime/library";
import { PaymentOrder, PaymentStatus } from "@prisma/client";


const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_INACTIVE_TIME = 24 * 60 * 60 * 1000; // 24 hours
const PENDING_TIMEOUT = 60 * 60 * 1000; // 1 hour
const FINAL_STATE_CLEANUP_DELAY = 500; // 500ms

// State transition map for restoring states
const STATE_TRANSITION_MAP: Record<PaymentStatus, string[]> = {
  [PaymentStatus.INITIALIZED]: [],
  [PaymentStatus.PENDING]: ["SUBMIT"],
  [PaymentStatus.SUCCESS]: ["SUBMIT", "PAYMENT_SUCCESS"],
  [PaymentStatus.FAILED]: ["SUBMIT", "PAYMENT_FAILED"],
};

// Final payment states
const FINAL_STATES = [
  PaymentStatus.SUCCESS,
  PaymentStatus.FAILED,
] as PaymentStatus[];

interface PaymentServiceInstance {
  actor: ReturnType<typeof createActor<typeof paymentMachine>>;
  metadata: {
    orderId: string;
    userId?: string;
    currentState: PaymentStatus;
    stateEnteredAt: Date;
    createdAt: Date;
    amount: number;
  };
}

export type PaymentEventData = {
  orderId: string;
  previousState: PaymentStatus;
  currentState: PaymentStatus;
  context: object;
};

export class PaymentServiceManager extends EventEmitter {
  private instances = new Map<string, PaymentServiceInstance>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = CLEANUP_INTERVAL_MS) {
    super();
    this.setMaxListeners(100);
    this.cleanupInterval = setInterval(
      () => this.cleanupInactiveInstances(),
      cleanupIntervalMs,
    );
  }

  /**
   * Create or retrieve a payment service instance
   */
  async createInstance(orderId: string, userId?: string) {
    // Return existing instance if available
    if (this.instances.has(orderId)) {
      return this.getInstance(orderId);
    }

    try {
      // Load order and latest event in parallel
      const [paymentOrder, paymentOrderEvent] = await Promise.all([
        prisma.paymentOrder.findUnique({ where: { id: orderId } }),
        prisma.paymentOrderEvent.findFirst({
          where: { orderId },
          orderBy: { changedAt: "desc" },
        }),
      ]);

      const amount = paymentOrder?.amountValue || 0;
      const errorMessage = (paymentOrderEvent?.metadata as JsonObject)
        ?.errorMessage as string | undefined;

      // Create actor with input data
      const actor = createActor(paymentMachine, {
        id: `payment-${orderId}`,
        input: {
          orderId,
          amount,
          errorMessage,
          transactionId: paymentOrderEvent?.transactionId,
          // previousStatus: previousState
        },
      });

      // Initialize instance
      const instance: PaymentServiceInstance = {
        actor,
        metadata: {
          orderId,
          userId,
          currentState: PaymentStatus.INITIALIZED,
          stateEnteredAt: new Date(),
          createdAt: new Date(),
          amount,
        },
      };

      // Set up instance and start
      this.instances.set(orderId, instance);
      this.setupInstanceListeners(instance);
      actor.start();

      // Restore state if needed
      if (paymentOrder?.status) {
        this.restoreState(actor, paymentOrder.status as PaymentStatus);
      }

      return actor;
    } catch (error) {
      this.cleanupFailedInstance(orderId);
      throw error;
    }
  }

  /**
   * Set up listeners for state changes
   */
  private setupInstanceListeners(instance: PaymentServiceInstance) {
    const orderId = instance.metadata.orderId;
    let previousState: PaymentStatus = instance.metadata.currentState;

    instance.actor.subscribe(async (snapshot) => {
      const currentState = String(snapshot.value) as PaymentStatus;

      // Update metadata
      instance.metadata.currentState = currentState;
      instance.metadata.stateEnteredAt = new Date();

      // Handle state change if needed
      if (previousState !== currentState) {
        await this.handleStateChange(
          orderId,
          previousState,
          currentState,
          snapshot,
        );
        previousState = currentState;
      }

      // Clean up instance if in final state
      if (FINAL_STATES.includes(currentState)) {
        setTimeout(
          () => this.removeInstance(orderId),
          FINAL_STATE_CLEANUP_DELAY,
        );
      }
    });
  }

  /**
   * Handle state transitions
   */
  private async handleStateChange(
    orderId: string,
    previousState: PaymentStatus,
    currentState: PaymentStatus,
    snapshot: SnapshotFrom<typeof paymentMachine>,
  ) {
    // fastifyIns.log.info(
    //   `Payment status change [${orderId}]: ${previousState} -> ${currentState}`,
    // );

    // Emit state change event
    this.emit("stateChange", {
      orderId,
      previousState,
      currentState,
      context: snapshot.context,
    });

    try {
      // Update database
      await updatePaymentStatusInDatabase(currentState, {
        orderId,
        transactionId: snapshot.context.transactionId,
        errorMessage: snapshot.context.errorMessage,
        previousStatus: previousState,
      });
    } catch (error) {
      console.error(`Database update failed for [${orderId}]:`, error);
      this.emit("error", { orderId, error });
    }
  }

  /**
   * Get instance by orderId
   */
  getInstance(orderId: string) {
    const instance = this.instances.get(orderId);
    if (!instance) throw new Error(`Payment instance not found: ${orderId}`);
    return instance.actor;
  }

  /**
   * Send event to payment instance
   */
  async sendEvent(orderId: string, event: PaymentEvent) {
    let actor = this.instances.get(orderId)?.actor;
    if (!actor) {
      actor = await this.createInstance(orderId, "");
      // throw new Error(`Payment instance not found: ${orderId}`)
    }

    // Capture state before event
    const beforeSnapshot = actor.getSnapshot();
    const beforeState = String(beforeSnapshot.value) as PaymentStatus;

    // Send event
    // fastifyIns.log.info(`Sending event [${orderId}]: ${event.type}`);
    actor.send(event);

    // Check if state changed
    const afterSnapshot = actor.getSnapshot();
    const afterState = String(afterSnapshot.value) as PaymentStatus;

    // Only update database if state changed
    if (beforeState !== afterState) {
      return updatePaymentStatusInDatabase(afterState, {
        orderId,
        transactionId: afterSnapshot.context.transactionId,
        errorMessage: afterSnapshot.context.errorMessage,
        previousStatus: beforeState,
      });
    }

    // Return current state if no change
    return [
      {
        status: afterState,
      } as PaymentOrder,
    ];
  }

  /**
   * Clean up inactive or timed out instances
   */
  private cleanupInactiveInstances() {
    const now = Date.now();

    for (const [orderId, instance] of this.instances.entries()) {
      try {
        const { currentState, stateEnteredAt, amount } = instance.metadata;
        const stateDuration = now - stateEnteredAt.getTime();

        // Clean up final states
        if (FINAL_STATES.includes(currentState)) {
          this.removeInstance(orderId);
          continue;
        }

        // Handle pending timeout
        if (
          currentState === PaymentStatus.PENDING &&
          stateDuration > PENDING_TIMEOUT
        ) {
          instance.actor.send({
            type: "PAYMENT_FAILED",
            orderId,
            amount,
            errorMessage: "Payment timeout",
            previousStatus: PaymentStatus.PENDING,
          });
          continue;
        }

        // General inactive cleanup
        if (stateDuration > MAX_INACTIVE_TIME) {
          this.removeInstance(orderId);
        }
      } catch (error) {
        console.error(`Cleanup failed for [${orderId}]:`, error);
      }
    }
  }

  /**
   * Clean up a failed instance
   */
  private cleanupFailedInstance(orderId: string) {
    if (this.instances.has(orderId)) {
      const instance = this.instances.get(orderId)!;
      instance.actor.stop();
      this.instances.delete(orderId);
    }
  }

  /**
   * Restore instance to target state
   */
  private restoreState(
    actor: ReturnType<typeof createActor<typeof paymentMachine>>,
    targetState: PaymentStatus,
  ): void {
    const events = STATE_TRANSITION_MAP[targetState] || [];
    for (const eventType of events) {
      actor.send({ type: eventType } as PaymentEvent);
    }
  }

  /**
   * Remove an instance
   */
  removeInstance(orderId: string) {
    const instance = this.instances.get(orderId);
    if (instance) {
      instance.actor.stop();
      this.instances.delete(orderId);
      return true;
    }
    return false;
  }

  /**
   * Shutdown the service manager
   */
  shutdown() {
    clearInterval(this.cleanupInterval);
    for (const [, instance] of this.instances) {
      instance.actor.stop();
    }
    this.instances.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
const paymentServiceManager = new PaymentServiceManager();
export default paymentServiceManager;
