import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { TokenInputSchema } from "@/schemas";

export async function POST(request: Request) {
  try {
    // 解析请求 URL 中的查询参数
    const url = new URL(request.url);
    const tokenInput = TokenInputSchema.safeParse({
      token: url.searchParams.get("token")
    });

    if (!tokenInput.success) {
      return errorResponse("无效的 token", 400, tokenInput.error);
    }

    const { token } = tokenInput.data;

    const order = await prisma.paymentOrder.findUnique({
      where: { id: token },
    });

    if (!order) {
      return errorResponse("订单未找到", 404);
    }

    if (new Date(order.expiredAt) < new Date()) {
      return errorResponse("支付订单已过期", 408);
    }

    return successResponse({
      resultCode: order.status,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      (error as Error)?.message || "查询订单状态时发生错误",
      500
    );
  }
}
