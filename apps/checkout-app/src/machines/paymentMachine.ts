import { assign, createMachine } from "xstate";
import { PaymentStatus } from "@prisma/client";

// 定义状态机上下文类型
export interface PaymentContext {
  orderId: string;
  amount: number;
  errorMessage?: string;
  transactionId?: string;
  previousStatus: PaymentStatus;
}

// 定义状态机事件类型
export type PaymentEvent =
  | {
      type: "SUBMIT";
      orderId: string;
      amount: number;
      previousStatus: PaymentStatus;
    }
  | {
      type: "PAYMENT_PROCESSING";
      orderId: string;
      amount: number;
      previousStatus: PaymentStatus;
    }
  | {
      type: "PAYMENT_SUCCESS";
      orderId: string;
      amount: number;
      transactionId: string;
      previousStatus: PaymentStatus;
    }
  | {
      type: "PAYMENT_FAILED";
      orderId: string;
      amount: number;
      errorMessage: string;
      previousStatus: PaymentStatus;
    }
  | {
      type: "RETRY";
      orderId: string;
      amount: number;
      previousStatus: PaymentStatus;
    };

// 创建支付状态机 - XState v5语法
export const paymentMachine = createMachine({
  id: "payment",
  initial: PaymentStatus.INITIALIZED,
  context: ({ input }: { input?: Partial<PaymentContext> }) => ({
    orderId: input?.orderId || "",
    amount: input?.amount || 0,
    errorMessage: input?.errorMessage,
    transactionId: input?.transactionId,
    previousStatus: input?.previousStatus || PaymentStatus.INITIALIZED,
  }),
  states: {
    // 初始化状态
    [PaymentStatus.INITIALIZED]: {
      on: {
        SUBMIT: {
          target: PaymentStatus.PENDING,
          actions: assign({
            orderId: ({ event }) => event.orderId,
            amount: ({ event }) => event.amount,
            previousStatus: () => PaymentStatus.INITIALIZED,
          }),
        },
      },
    },
    // 等待中状态
    [PaymentStatus.PENDING]: {
      on: {
        PAYMENT_PROCESSING: {
          target: PaymentStatus.PENDING,
          actions: assign({
            previousStatus: () => PaymentStatus.PENDING,
          }),
        },
        PAYMENT_SUCCESS: {
          target: PaymentStatus.SUCCESS,
          actions: assign({
            transactionId: ({ event }) => event.transactionId,
            previousStatus: () => PaymentStatus.PENDING,
          }),
        },
        PAYMENT_FAILED: {
          target: PaymentStatus.FAILED,
          actions: assign({
            errorMessage: ({ event }) => event.errorMessage,
            previousStatus: () => PaymentStatus.PENDING,
          }),
        },
      },
    },
    // 成功状态
    [PaymentStatus.SUCCESS]: {
      type: "final",
    },
    // 失败状态
    [PaymentStatus.FAILED]: {
      on: {
        RETRY: {
          target: PaymentStatus.FAILED,
          actions: assign({
            errorMessage: () => undefined,
            previousStatus: () => PaymentStatus.FAILED,
          }),
        },
      },
    },
  },
  types: {
    context: {} as PaymentContext,
    events: {} as PaymentEvent,
  },
});
