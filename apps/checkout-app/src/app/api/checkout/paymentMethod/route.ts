import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { PayMethod } from "@/app/checkout/fp-checkout-type";

// 处理获取支付方式的请求
export async function GET() {
  try {
    // 查询所有支付方式
    const paymentMethods = (await prisma.paymentMethod.findMany({
      include: {
        currencyInfo: true,
      },
    })) as unknown as PayMethod[];

    // 格式化数据
    const formattedMethods = paymentMethods.map((paymentMethod) => {
      return {
        ...paymentMethod,
        merchantId: "1809526015647685123", // 转换为字符串防止数值溢出
        productChannelId: "1809526015647685123",
      };
    });

    // 返回成功响应
    return successResponse(formattedMethods);
  } catch (error) {
    console.error("获取支付方式失败:", error);
    return errorResponse("服务器内部错误", 500);
  }
}
