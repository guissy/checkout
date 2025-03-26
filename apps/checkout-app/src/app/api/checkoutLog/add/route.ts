import { NextRequest } from "next/server";
import * as zod from "zod";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
// import { CheckoutLog } from "@/api/generated/check_log";

// 定义日志参数类型
const CheckoutLogParamSchema = zod.object({
  requestTag: zod.string(),
  requestMethod: zod.string(),
  requestUrl: zod.string(),
  requestTime: zod.string(),
  requestHeader: zod.string(),
  requestBody: zod.string(),
  responseTime: zod.string(),
  responseMessage: zod.string(),
  responseStatus: zod.string(),
  responseInterval: zod.number(),
  remark: zod.string(),
  token: zod.string().optional(),
  details: zod.string().optional(),
  downstreamOrderNo: zod.string().optional(),
});

// 定义日志输入类型
const CheckoutLogInputSchema = zod.object({
  param: CheckoutLogParamSchema,
});

// 处理添加日志的请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证请求参数
    const validation = CheckoutLogInputSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("无效的请求参数", 400, validation.error);
    }

    const { param } = validation.data;

    // 记录日志到数据库
    const log = await prisma.checkoutLog.create({
      data: {
        orderId: param.token ?? "",
        action: param.requestTag,
        status: param.responseStatus,
        details: JSON.stringify({
          requestBody: param.requestBody,
          responseMessage: param.responseMessage,
        }),
        userId: "system",
        ipAddress: request.headers.get("x-forwarded-for") || "",
        userAgent: request.headers.get("user-agent") || "",
        createdAt: new Date(),
        origin: "",
        requestMethod: param.requestMethod,
        requestUrl: param.requestUrl,
        requestTime: param.requestTime,
        responseTime: param.responseTime,
        responseInterval: param.responseInterval,
        downstreamOrderNo: param.downstreamOrderNo || "",
      },
    });

    // 返回成功响应
    return successResponse({
      id: log.id,
      createdAt: log.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("添加日志失败:", error);
    return errorResponse("服务器内部错误", 500);
  }
}
