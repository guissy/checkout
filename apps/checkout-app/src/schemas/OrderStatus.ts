import { z } from "zod";
import { PaymentStatus } from "./PaymentStatus";

// 定义 OrderStatus 的 Schema
export const OrderStatusSchema = z
  .object({
    acquiringMode: z.string().describe("收单模式"),
    buyerId: z.string().describe("买家 ID"),
    channelId: z.number().describe("渠道 ID"),
    channelRatesId: z.number().describe("渠道费率 ID"),
    channelRequestTime: z.number().describe("渠道请求时间 (Unix 时间戳)"),
    country: z
      .string()
      .min(2)
      .max(3)
      .describe("国家代码 (ISO 3166-1 Alpha-2/Alpha-3)"),
    currency: z.string().length(3).describe("货币代码 (ISO 4217)"),
    downstreamEstimatedAmount: z.number().min(0).describe("预估下游金额"),
    downstreamEstimatedFee: z.number().min(0).describe("预估下游费用"),
    downstreamFee: z.string().describe("下游费用详情"),
    downstreamFeeC: z.string().describe("下游费用 C 版本"),
    downstreamFixedFee: z.string().describe("下游固定费用"),
    downstreamGatewayFee: z.string().describe("下游网关费用"),
    downstreamOrderNo: z.string().describe("下游订单号"),
    downstreamOrderNoOrigin: z.string().describe("原始下游订单号"),
    downstreamRedirectUrl: z.string().url().describe("下游跳转 URL"),
    downstreamTxRate: z.string().describe("下游交易汇率"),
    errorMsg: z.string().describe("错误信息"),
    estimatedAmount: z.number().min(0).describe("预估金额"),
    estimatedExchangeRate: z.string().describe("预估汇率"),
    failReason: z.string().describe("失败原因"),
    freezeType: z.number().describe("冻结类型"),
    id: z.number().describe("订单 ID"),
    merchantCurrency: z.string().length(3).describe("商户货币代码"),
    merchantId: z.number().describe("商户 ID"),
    merchantName: z.string().describe("商户名称"),
    merchantOrderAmount: z.number().min(0).describe("商户订单金额"),
    merchantRequestTime: z.number().describe("商户请求时间 (Unix 时间戳)"),
    orderAmount: z.number().min(0).describe("订单金额"),
    orderCreateTime: z.number().describe("订单创建时间 (Unix 时间戳)"),
    orderStatus: z.nativeEnum(PaymentStatus).describe("订单状态枚举"),
    orderType: z.string().describe("订单类型"),
    origin: z.string().describe("订单来源"),
    paymentExchange: z.number().describe("支付兑换金额"),
    paymentExchangeRate: z.number().describe("支付兑换汇率"),
    paymentMethod: z.string().describe("支付方式"),
    paymentTxMarkup: z.number().describe("支付交易加成").optional(),
    paymentTxMarkupUsd: z.number().describe("美元支付交易加成").optional(),
    platformId: z.number().describe("平台 ID"),
    platformOrderNo: z.string().describe("平台订单号"),
    productChannelId: z.number().describe("产品渠道 ID"),
    productId: z.number().describe("产品 ID"),
    profit: z.number().describe("利润"),
    providerId: z.number().describe("供应商 ID"),
    requestStatus: z.number().describe("请求状态"),
    reviewStatus: z.string().describe("审核状态"),
    riskType: z.number().describe("风险类型"),
    sessionId: z.string().describe("会话 ID"),
    settlementCurrency: z.string().length(3).describe("结算货币代码"),
    settlementCycle: z.string().describe("结算周期"),
    transactionType: z.string().describe("交易类型"),
    upstreamEstimatedAmount: z.number().min(0).describe("上游预估金额"),
    upstreamEstimatedFee: z.number().min(0).describe("上游预估费用"),
    upstreamFee: z.string().describe("上游费用"),
    upstreamFixedFee: z.string().describe("上游固定费用"),
    upstreamGatewayFee: z.string().describe("上游网关费用"),
    upstreamOrderNo: z.string().describe("上游订单号"),
    upstreamStatus: z.string().describe("上游状态"),
    upstreamTxRate: z.string().describe("上游交易汇率"),
  })
  .describe("订单状态对象，包含详细的支付信息、订单信息和交易信息");

export const OrderStatusOutputSchema = z.string();

// 生成 TypeScript 类型
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderStatusOutput = z.infer<typeof OrderStatusOutputSchema>;
