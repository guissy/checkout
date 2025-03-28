import { prisma } from "@/lib/prisma";
import { PaymentOrder, PaymentOrderEvent, PaymentStatus } from "@prisma/client";
import { PaymentServiceManager } from "./payService";

// 使用 Prisma 更新数据库中的支付状态
export const updatePaymentStatusInDatabase = async (
  status: PaymentStatus,
  data: {
    previousStatus?: PaymentStatus;
    orderId: string;
    apiPath: string;
    reason: string;
    errorMessage?: string;
  },
): Promise<[PaymentOrder, PaymentOrderEvent]> => {
  try {
    const paymentOrder = await prisma.paymentOrder.update({
      where: { id: data.orderId },
      data: {
        status,
        transactionIds: ["1"],
      },
    });
    const paymentOrderEvent = await prisma.paymentOrderEvent.create({
      data: {
        orderId: data.orderId,
        previousStatus: data.previousStatus!,
        transactionId: data.apiPath,
        newStatus: status,
        changedBy: data.reason,
        metadata: data,
      },
    });
    console.log(`数据库更新成功: 状态=${status}`, PaymentServiceManager.__id__);
    return [paymentOrder, paymentOrderEvent];
  } catch (error) {
    console.error("数据库更新失败:", error);
    throw error;
  }
};

export const getPaymentStatusInDatabase = async (
  orderId: string,
): Promise<PaymentOrder | null> => {
  try {
    const paymentOrder = await prisma.paymentOrder.findUnique({
      where: { id: orderId },
    });
    return paymentOrder;
  } catch (error) {
    console.error("数据库查询失败:", error);
    throw error;
  }
};
