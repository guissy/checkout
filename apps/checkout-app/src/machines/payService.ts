import { createActor } from "xstate";
import { prisma } from "@/lib/prisma";
import { EventEmitter } from "events";
import { PaymentEvent, paymentMachine } from "./paymentMachine";
import {
  getPaymentStatusInDatabase,
  updatePaymentStatusInDatabase,
} from "./payDb";
import { JsonObject } from "@prisma/client/runtime/library";
import { PaymentOrder, PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_INACTIVE_TIME = 24 * 60 * 60 * 1000; // 24 hours
const PENDING_TIMEOUT = 60 * 60 * 1000; // 1 hour

const STATE_TRANSITION_MAP: Record<PaymentStatus, string[]> = {
  [PaymentStatus.INITIALIZED]: [],
  [PaymentStatus.PENDING]: ["SUBMIT"],
  [PaymentStatus.SUCCESS]: ["SUBMIT", "PAYMENT_SUCCESS"],
  [PaymentStatus.FAILED]: ["SUBMIT", "PAYMENT_FAILED"],
};

const FINAL_STATES = [
  PaymentStatus.SUCCESS,
  PaymentStatus.FAILED,
] as PaymentStatus[];

interface PaymentServiceInstance {
  actor: ReturnType<typeof createActor<typeof paymentMachine>>;
  stateEnteredAt: Date;
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
  public static __id__ = randomUUID();

  constructor(cleanupIntervalMs = CLEANUP_INTERVAL_MS) {
    super();
    this.setMaxListeners(100);
    this.cleanupInterval = setInterval(
      () => this.cleanupInactiveInstances(),
      cleanupIntervalMs,
    );
  }

  async createInstance(orderId: string, apiPath?: string) {
    if (this.instances.has(orderId)) {
      return this.getInstance(orderId);
    }

    try {
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

      const actor = createActor(paymentMachine, {
        id: `payment-${orderId}`,
        input: {
          orderId,
          amount,
          errorMessage,
          transactionId: paymentOrderEvent?.transactionId,
          apiPath: apiPath || "__create__",
          reason: "create",
          currentState: PaymentStatus.INITIALIZED,
          stateEnteredAt: new Date(),
        },
      });

      const instance: PaymentServiceInstance = {
        actor,
        stateEnteredAt: new Date(),
      };

      this.instances.set(orderId, instance);
      this.setupInstanceListeners(instance);
      actor.start();

      return actor;
    } catch (error) {
      this.cleanupFailedInstance(orderId);
      throw error;
    }
  }

  private setupInstanceListeners(instance: PaymentServiceInstance) {
    const actor = instance.actor;
    const snapshot = actor.getSnapshot();
    const orderId = snapshot.context.orderId;
    let previousState = String(snapshot.value) as PaymentStatus;

    instance.actor.subscribe(async (snapshot) => {
      const currentState = String(snapshot.value) as PaymentStatus;
      instance.stateEnteredAt = new Date();

      if (previousState !== currentState) {
        this.emit("stateChange", {
          orderId,
          previousState,
          currentState,
          context: snapshot.context,
        });
        previousState = currentState;
      }
    });
  }

  getInstance(orderId: string) {
    const instance = this.instances.get(orderId);
    if (!instance) throw new Error(`Payment instance not found: ${orderId}`);
    return instance.actor;
  }

  async sendEvent(orderId: string, event: PaymentEvent, apiPath: string = "") {
    let actor = this.instances.get(orderId)?.actor;
    if (!actor) {
      actor = await this.createInstance(orderId, apiPath);
    }

    const beforeSnapshot = actor.getSnapshot();
    const beforeState = String(beforeSnapshot.value) as PaymentStatus;
    const context = beforeSnapshot.context;

    actor.send(event);

    const afterSnapshot = actor.getSnapshot();
    const afterState = String(afterSnapshot.value) as PaymentStatus;

    if (beforeState !== afterState) {
      return updatePaymentStatusInDatabase(afterState, {
        orderId,
        apiPath: context.apiPath,
        reason: context.reason,
        errorMessage: afterSnapshot.context.errorMessage,
        previousStatus: beforeState,
      });
    }

    const paymentOrder = await getPaymentStatusInDatabase(orderId);
    return [
      {
        ...paymentOrder,
        status: afterState,
      } as PaymentOrder,
    ];
  }

  private cleanupInactiveInstances() {
    const now = Date.now();

    for (const [orderId, instance] of this.instances.entries()) {
      try {
        const snapshot = instance.actor.getSnapshot();
        const currentState = String(snapshot.value) as PaymentStatus;
        const { amount } = snapshot.context;
        const stateDuration = now - instance.stateEnteredAt.getTime();

        if (FINAL_STATES.includes(currentState)) {
          this.removeInstance(orderId);
          continue;
        }

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

        if (stateDuration > MAX_INACTIVE_TIME) {
          this.removeInstance(orderId);
        }
      } catch (error) {
        console.error(`Cleanup failed for [${orderId}]:`, error);
      }
    }
  }

  private cleanupFailedInstance(orderId: string) {
    if (this.instances.has(orderId)) {
      const instance = this.instances.get(orderId)!;
      instance.actor.stop();
      this.instances.delete(orderId);
    }
  }

  private restoreState(
    actor: ReturnType<typeof createActor<typeof paymentMachine>>,
    targetState: PaymentStatus,
  ): void {
    const events = STATE_TRANSITION_MAP[targetState] || [];
    for (const eventType of events) {
      actor.send({ type: eventType } as PaymentEvent);
    }
  }

  removeInstance(orderId: string) {
    const instance = this.instances.get(orderId);
    if (instance) {
      instance.actor.stop();
      this.instances.delete(orderId);
      return true;
    }
    return false;
  }

  shutdown() {
    clearInterval(this.cleanupInterval);
    for (const [, instance] of this.instances) {
      instance.actor.stop();
    }
    this.instances.clear();
    this.removeAllListeners();
  }
}

let paymentServiceManagerInstance: PaymentServiceManager | null = null;

export function getPaymentServiceManager(): PaymentServiceManager {
  if (!paymentServiceManagerInstance) {
    paymentServiceManagerInstance = new PaymentServiceManager();
  }
  return paymentServiceManagerInstance;
}
