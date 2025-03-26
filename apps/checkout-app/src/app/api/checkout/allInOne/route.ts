import { PaymentStatus } from "@prisma/client";
import { errorResponse, successResponse } from "@/lib/api/response";
import { PaymentInputSchema, TokenInputSchema } from "@/schemas";
import paymentServiceManager from "@/machines/payService";
import { PaymentEvent } from "@/machines/paymentMachine";

export async function POST(request: Request) {
  try {
    // 解析请求 URL 中的查询参数
    const url = new URL(request.url);
    const tokenInput = TokenInputSchema.safeParse({
      token: url.searchParams.get("token")
    });

    if (!tokenInput.success) {
      return errorResponse("Invalid token", 400, tokenInput.error);
    }

    const { token } = tokenInput.data;

    // 解析请求体
    const body = await request.json();
    const paymentInput = PaymentInputSchema.safeParse(body);

    if (!paymentInput.success) {
      return errorResponse("Invalid request body", 400, paymentInput.error);
    }

    const [updatedOrder] = await paymentServiceManager.sendEvent(token, {
      type: "SUBMIT",
      orderId: token,
      amount: paymentInput.data.amount.value,
      previousStatus: PaymentStatus.INITIALIZED,
    } as PaymentEvent);

    const reference = updatedOrder?.reference;

    return successResponse({
      action: {
        type: "redirect",
        url: "https://open-sea-global.alipayplus.com/api/open/v1/ac/cashier/self/codevalue/checkout.htm?codeValue=281666040098Z1WJ1kpBg7QoFo2tln22r7Zr&loadMode=2",
        payUrl: `https://checkout.futurepay-develop.com/alipayPlus?reference=${reference}`,
        paymentMethodType: paymentInput.data.paymentMethod.type,
        method: "GET",
        qrCode: "281666040098Z1WJ1kpBg7QoFo2tln22r7Zr",
        fields: [],
      },
      amount: paymentInput.data.amount,
      merchantReference: reference,
      pspReference: "1896630129120116736",
      resultCode: updatedOrder?.status,
      providerReference: "20250303190741010002C0008291669",
      refusalReason: "",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      (error as Error)?.message || "处理支付请求时发生错误",
      409
    );
  }
}
