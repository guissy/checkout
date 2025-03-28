import { errorResponse, successResponse } from "@/lib/api/response";

export async function GET() {
  try {
    // 使用通用的成功响应函数
    return successResponse("Hello World!");
  } catch (error) {
    console.error("创建订单失败:", error);

    // 使用通用的错误响应函数
    return errorResponse("服务器内部错误", 500);
  }
}
