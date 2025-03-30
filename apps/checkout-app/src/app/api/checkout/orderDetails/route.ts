import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { encryptAES } from "@/utils/cryptoAES";

export async function GET(request: NextRequest) {
  try {
    // 从 URL 获取查询参数
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    // 验证 token 参数
    if (!token) {
      return errorResponse("缺少必要参数: token", 400);
    }

    // 查询订单信息
    const order = await prisma.paymentOrder.findUnique({
      where: {
        id: token,
      },
    });

    // 检查订单是否存在
    if (!order) {
      return errorResponse("订单不存在", 404);
    }

    // 检查订单是否过期
    if (new Date(order.expiredAt) < new Date()) {
      return errorResponse("支付订单已过期", 408, { code: 40027 });
    }
    const host = (`${process.env.NEXT_PUBLIC_API_BASE_URL}` || "").replace(
      "/api",
      "",
    );
    // 构建输出数据
    const output1 = {
      ...order,
      processingCurrency: order.amountCurrency,
      pspReference: "",
      isexchange: true,
      returnUrl: `${host}/checkout/?token=${order.id}`,
      amount: {
        currency: order.amountCurrency,
        value: order.amountValue,
      },
    };
    const output = output1 as Partial<typeof output1>;

    // 删除不需要的字段
    delete output.id;
    delete output.isExchange;
    delete output.createdAt;
    delete output.amountValue;
    delete output.amountCurrency;
    delete output.paymentMethodId;

    // 加密输出数据并返回
    const encryptedData = await encryptAES(JSON.stringify(output));

    return successResponse(encryptedData);
  } catch (error) {
    console.error("获取订单详情失败:", error);

    // 使用通用的错误响应函数
    return errorResponse("服务器内部错误", 500);
  }
}
