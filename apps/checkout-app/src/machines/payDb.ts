import { prisma } from "@/lib/prisma";
import { PaymentOrder, PaymentOrderEvent, PaymentStatus } from "@prisma/client";

// 使用 Prisma 更新数据库中的支付状态
export const updatePaymentStatusInDatabase = async (
  status: PaymentStatus,
  data: {
    previousStatus?: PaymentStatus;
    orderId: string;
    transactionId?: string;
    errorMessage?: string;
  },
): Promise<[PaymentOrder, PaymentOrderEvent]> => {
  const transactionId = "1";
  try {
    const paymentOrder = await prisma.paymentOrder.update({
      where: { id: data.orderId },
      data: {
        status,
        transactionIds: ["1"],
        // ...(data.transactionId && { transactionId: data.transactionId }),
        // ...(data.errorMessage && { errorMessage: data.errorMessage }),
      },
    });
    const paymentOrderEvent = await prisma.paymentOrderEvent.create({
      data: {
        orderId: data.orderId,
        previousStatus: data.previousStatus!,
        transactionId: transactionId,
        newStatus: status,
        changedBy: "user@submit or systerm@timeout",
        metadata: data,
      },
    });
    console.log(`数据库更新成功: 状态=${status}`);
    return [paymentOrder, paymentOrderEvent];
  } catch (error) {
    console.error("数据库更新失败:", error);
    throw error;
  }
};
