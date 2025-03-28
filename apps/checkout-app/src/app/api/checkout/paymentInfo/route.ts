import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { ReferenceInputSchema, TokenInputSchema } from "@/schemas";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求体
    const bodySchema = z.intersection(ReferenceInputSchema, TokenInputSchema);
    const validatedBody = bodySchema.safeParse(body);

    if (!validatedBody.success) {
      return errorResponse("无效的请求参数", 400, validatedBody.error);
    }

    const { token, reference } = validatedBody.data;

    // 查询订单
    const order = await prisma.paymentOrder.findUnique({
      where: { id: token },
    });

    if (!order) {
      return errorResponse("订单未找到", 404);
    }

    if (new Date(order.expiredAt) < new Date()) {
      return errorResponse("支付订单已过期", 408);
    }

    // 返回支付信息
    return successResponse({
      action: {
        type: "redirect",
        url: "https://open-sea-global.alipayplus.com/api/open/v1/ac/cashier/self/codevalue/checkout.htm?codeValue=281666040098Z1WJ1kpBg7QoFo2tln22r7Zr&loadMode=2",
        payUrl: `https://localhost:3000/alipayPlus?reference=${reference}`,
        paymentMethodType: "alipaycn",
        method: "GET",
        qrCode: "281666040098Z1WJ1kpBg7QoFo2tln22r7Zr",
        fields: [],
      },
      amount: {
        value: order.amountValue,
        currency: order.amountCurrency,
      },
      merchantReference: reference,
      pspReference: "1896630129120116736",
      resultCode: PaymentStatus.PENDING,
      providerReference: "20250303190741010002C0008291669",
      refusalReason: "",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      (error as Error)?.message || "查询支付信息时发生错误",
      500,
    );
  }
}
