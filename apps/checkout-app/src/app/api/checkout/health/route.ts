import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";


export async function GET(request: NextRequest) {
  try {
    // 从 URL 获取查询参数
    const searchParams = request.nextUrl.searchParams

    // 解析并验证请求参数
    const amountParam = searchParams.get("amount");
    const currencyParam = searchParams.get("currency") || "USD";

    // 解析amount参数
    let amountValue = 0;
    if (amountParam) {
      const parsedAmount = parseInt(amountParam, 10);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        amountValue = parsedAmount / 100; // 转换为实际金额
      } else {
        amountValue = Math.floor(Math.random() * 999) + 1; // 随机金额
        amountValue = amountValue / 100;
      }
    } else {
      amountValue = Math.floor(Math.random() * 999) + 1; // 随机金额
      amountValue = amountValue / 100;
    }

    // 获取 referer 或使用默认值
    const { protocol, hostname } = {
      protocol: "https",
      hostname: "localhost:3000",
    };
    const host = `${protocol}//${hostname}`;

    // 创建订单
    const created = await prisma.paymentOrder.create({
      data: {
        countryCode: "CN",
        amountCurrency: currencyParam,
        amountValue: amountValue,
        productId: "1",
        merchantId: "1",
        origin: "xyz.com",
        productName: "IPhone 12 Pro Max",
        productDetail: "A brand new iPhone 12 Pro Max with 128GB storage and 5G support.",
        pspReference: Date.now().toString(),
        reference: Date.now().toString() + Math.random().toString().replace(".", ""),
        returnUrl: `${host}/debug`,
        isExchange: true,
        merchantAccount: "9.99",
        webhookUrl: "https://xyz.com/webhook",
        expiredAt: new Date(Date.now() + 1000 * 60 * 42), // 42分钟后过期
        transactionIds: ["1"],
      },
    });

    // 创建支付服务实例
    // await paymentServiceManager.createInstance(created.id, "user123");

    // 构建返回URL
    const output = {
      checkOutUrl: `${host}/?token=${created?.id}`,
    };

    // 使用通用的成功响应函数
    return successResponse(output);
  } catch (error) {
    console.error("创建订单失败:", error);

    // 使用通用的错误响应函数
    return errorResponse("服务器内部错误", 500);
  }
}
