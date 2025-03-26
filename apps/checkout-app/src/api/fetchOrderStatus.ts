import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";

export interface orderStatusParams {
  reference: string;
}

export type OrderStatus = {
  acquiringMode: string;
  buyerId: string;
  channelId: number;
  channelRatesId: number;
  channelRequestTime: number;
  country: string;
  currency: string;
  downstreamEstimatedAmount: number;
  downstreamEstimatedFee: number;
  downstreamFee: string;
  downstreamFeeC: string;
  downstreamFixedFee: string;
  downstreamGatewayFee: string;
  downstreamOrderNo: string;
  downstreamOrderNoOrigin: string;
  downstreamRedirectUrl: string;
  downstreamTxRate: string;
  errorMsg: string;
  estimatedAmount: number;
  estimatedExchangeRate: string;
  failReason: string;
  freezeType: number;
  id: number;
  merchantCurrency: string;
  merchantId: string;
  merchantName: string;
  merchantOrderAmount: number;
  merchantRequestTime: number;
  orderAmount: number;
  orderCreateTime: number;
  orderStatus: string;
  orderType: string;
  origin: string;
  paymentExchange: number;
  paymentExchangeRate: number;
  paymentMethod: string;
  paymentTxMarkup: number;
  paymentTxMarkupUsd: number;
  platformId: number;
  platformOrderNo: string;
  productChannelId: number;
  productId: string;
  profit: number;
  providerId: number;
  requestStatus: number;
  reviewStatus: string;
  riskType: number;
  sessionId: string;
  settlementCurrency: string;
  settlementCycle: string;
  transactionType: string;
  upstreamEstimatedAmount: number;
  upstreamEstimatedFee: number;
  upstreamFee: string;
  upstreamFixedFee: string;
  upstreamGatewayFee: string;
  upstreamOrderNo: string;
  upstreamStatus: string;
  upstreamTxRate: string;
};

/**
 * 获取订单状态API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchOrderStatus(
  data: orderStatusParams,
  ctx: "Visible" | "Reload" | "PageShow" | "Loop" | "Complete" | "OtpPage",
): Promise<FpResponse<string>> {
  return createApiRequest<string>({
    url: getApi() + "/checkout/orderStatus",
    method: "GET",
    queryParams: {
      reference: data.reference,
    },
    name: `orderStatus${ctx}`,
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
  });
}