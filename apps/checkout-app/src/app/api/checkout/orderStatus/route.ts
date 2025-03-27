import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { ReferenceInputSchema } from "@/schemas";
import { PaymentStatus } from "@prisma/client";
import paymentServiceManager from "@/machines/payService";
import { encryptAES } from "@/utils/cryptoAES";

// 用于模拟成功支付的集合
const successSet = new Set<string>();

export async function GET(request: Request) {
  try {
    // 解析请求 URL 中的查询参数
    const url = new URL(request.url);
    const referenceInput = ReferenceInputSchema.safeParse({
      reference: url.searchParams.get("reference")
    });

    if (!referenceInput.success) {
      return errorResponse("无效的引用编号", 400, referenceInput.error);
    }

    const { reference } = referenceInput.data;

    const order = await prisma.paymentOrder.findUnique({
      where: { reference },
    });

    if (!order) {
      return errorResponse("订单未找到", 404);
    }

    if (new Date(order.expiredAt) < new Date()) {
      return errorResponse("支付订单已过期", 408);
    }

    // 模拟支付结果
    const isSuccess = successSet.has(reference) || Math.random() < 0.3;
    const isPending = Math.random() < 0.8;

    if (isSuccess) {
      successSet.add(reference);
    }

    let res: { status: PaymentStatus };
    if (isSuccess) {
      [res] = await paymentServiceManager.sendEvent(order.id, {
        type: "PAYMENT_SUCCESS",
        orderId: order.id,
        transactionId: "1",
        amount: order.amountValue,
        previousStatus: order.status,
      });
    } else if (isPending) {
      [res] = await paymentServiceManager.sendEvent(order.id, {
        type: "RETRY",
        orderId: order.id,
        amount: order.amountValue,
        previousStatus: order.status,
      });
    } else {
      [res] = await paymentServiceManager.sendEvent(order.id, {
        type: "PAYMENT_FAILED",
        orderId: order.id,
        errorMessage: "Error message!!!",
        amount: order.amountValue,
        previousStatus: order.status,
      });
    }
    console.log("🐌🐌🐌", isSuccess, isPending, res, order.id);
    // 构建支付数据
    const paymentData = {
      acquiringMode: "checkout",
      buyerId: "FPc8344bdafa514bda9c260ecddedb3e9a",
      channelId: 10545,
      channelRatesId: 532,
      channelRequestTime: 0,
      country: "DE",
      currency: "USD",
      downstreamEstimatedAmount: 1,
      downstreamEstimatedFee: 0,
      downstreamFee: '{"DISCOUNT_FEE":"0USD"}',
      downstreamFeeC: '{"DISCOUNT_FEE":"0USD"}',
      downstreamFixedFee: "{}",
      downstreamGatewayFee: '{"GATEWAY_FEE":"10USD"}',
      downstreamNotifyUrl:
        "https://wallet.futurepay-develop.com/api/PayNotify/callback/pay_environment/produce",
      downstreamOrderNo: "4FCC698A813B439993B1AEA17A5EAE06",
      downstreamOrderNoOrigin: "4FCC698A813B439993B1AEA17A5EAE06",
      downstreamRedirectUrl: `http://localhost:3000/?token=${order.id}`,
      downstreamTxRate: '{"DISCOUNT_FEE":"0"}',
      errorMsg: "orderStatus: The payment in process.",
      estimatedAmount: 1,
      estimatedExchangeRate:
        '{"KRWUSD":0.000685,"THBUSD":0.029219,"CADUSD":0.692152,"HKDUSD":0.128581}',
      failReason: "orderStatus: The payment in process.",
      freezeType: 0,
      holderName: "guissy guissy",
      id: 1556799,
      merchantCurrency: "USD",
      merchantId: 1,
      merchantName: "君诺科技",
      merchantOrderAmount: 1,
      merchantRequestTime: 0,
      orderAmount: 1,
      orderCreateTime: Date.now(),
      orderStatus: res?.status ?? PaymentStatus.PENDING,
      orderType: "transaction",
      origin: "xyz.com",
      paymentExchange: 0,
      paymentExchangeRate: 0,
      paymentMethod: "alipaycn",
      platformId: 220,
      platformOrderNo: "1896639198375575552",
      productChannelId: 1809526015647685553,
      productDetail: "debug产品描述信息",
      productId: 2,
      productName: "1111",
      profit: 0,
      providerId: 160,
      requestCount: 1,
      requestStatus: 0,
      reviewStatus: "normal",
      riskType: 0,
      sessionId: "6ce48010-330a-417e-ad03-f270d36330e0",
      settlementCurrency: "USD",
      settlementCycle: "D2",
      shopperEmail: "guissy@qq.com",
      transactionType: "wallet",
      upstreamEstimatedAmount: 1,
      upstreamEstimatedFee: 0,
      upstreamFee: '{"DISCOUNT_FEE":"0USD"}',
      upstreamFixedFee: "{}",
      upstreamGatewayFee: "{}",
      upstreamOrderNo: "20250303190741010007G0008275679",
      upstreamStatus: "PAYMENT_IN_PROCESS",
      upstreamTxRate: '{"DISCOUNT_FEE":"0"}',
    };

    const encryptData = await encryptAES(JSON.stringify(paymentData));
    return successResponse(encryptData);
  } catch (error) {
    console.error(error);
    return errorResponse(
      (error as Error)?.message || "查询订单结果状态时发生错误",
      500
    );
  }
}
