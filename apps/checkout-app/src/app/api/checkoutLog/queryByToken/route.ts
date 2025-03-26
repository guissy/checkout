import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckoutLog } from "@prisma/client";
import { errorResponse, successResponse } from "@/lib/api/response";
// import { CheckoutLog } from "@/api/generated/check_log";

// 处理按 token 查询日志的请求
export async function GET(request: NextRequest) {
  try {
    // 从 URL 获取查询参数
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    // 验证 token 参数
    if (!token) {
      return errorResponse("缺少必要参数: token", 400);
    }

    // 查询日志
    const logs = await prisma.checkoutLog.findMany({
      where: {
        orderId: token,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 格式化日志数据
    const formattedLogs = logs.map((log: CheckoutLog) => ({
      id: log.id,
      orderId: log.orderId,
      requestTag: log.action,
      responseStatus: log.status,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      requestMethod: log.requestMethod,
      requestUrl: log.requestUrl,
      responseTime: log.responseTime,
      responseInterval: log.responseInterval,
      token: log.orderId,
    }));

    // 返回成功响应
    return successResponse(formattedLogs);
  } catch (error) {
    console.error("查询日志失败:", error);
    return errorResponse("服务器内部错误", 500);
  }
}
