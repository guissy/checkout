import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // 从 URL 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const inCurrency = searchParams.get("in");
    const outCurrency = searchParams.get("out");
    const token = searchParams.get("token");

    // 验证必要参数
    if (!inCurrency || !outCurrency || !token) {
      return errorResponse("缺少必要参数: in, out 或 token", 400);
    }

    // 查询汇率信息
    let exchangeTransaction = await prisma.exchangeTransaction.findFirst({
      select: {
        in: true,
        out: true,
        exRate: true,
        futurePayRate: true,
      },
      where: {
        in: inCurrency,
        out: outCurrency,
      },
    });

    // 如果没有找到汇率信息，且源币种和目标币种相同，则设置汇率为 1
    if (!exchangeTransaction) {
      if (inCurrency === outCurrency) {
        exchangeTransaction = {
          in: inCurrency,
          out: outCurrency,
          exRate: new Prisma.Decimal(1),      // Convert to Decimal
          futurePayRate: new Prisma.Decimal(1), // Convert to Decimal
        };
      } else {
        // 如果找不到汇率信息，返回错误
        return errorResponse("未找到对应的汇率信息", 404);
      }
    }

    // 返回成功响应
    return successResponse(exchangeTransaction);
  } catch (error) {
    console.error("获取汇率信息失败:", error);

    // 使用通用的错误响应函数
    return errorResponse("服务器内部错误", 500);
  }
}
