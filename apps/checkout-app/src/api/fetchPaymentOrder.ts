import { createApiRequest } from "./apiClient";
import getApi from "./getApi";
import type { FpResponse } from "./api.type";
import gotoTimeout from "../utils/gotoTimeout";
import { AllInOneRes } from "./generated/all_in_one";

export interface PaymentOrderRes {
  action?: {
    paymentMethodType: string;
    url: string;
    applinkUrl?: string;
    schemeUrl?: string;
    payUrl?: string;
    method: string;
    type: "redirect" | "pin" | "avs" | "sms" | "qrcode";
    qrCode: string;
    message: string;
    fields: string[];
  };
  amount?: {
    currency: string;
    value: number;
  };
  order?: {
    account: string;
    amount: {
      currency: string;
      value: number;
    };
    accountName: string;
    bank: string;
    expiresAt: string;
    note: string;
  };
  customer?: {
    id: string;
    phone: string;
    name: string;
    email: string;
    createdAt: string;
  };
  refusalReason: string; // 错误消息
  pspReference: string;
  reference?: string;
  resultCode: string;
}

/**
 * 支付订单API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchPaymentOrder(
  data: Record<string, unknown>,
  headers: Record<string, string>,
  params: {
    token: string;
  },
): Promise<FpResponse<PaymentOrderRes>> {
  return createApiRequest<PaymentOrderRes>({
    url: getApi() + "/checkout/allInOne",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/protobuf",
      ...headers,
    },
    body: data,
    queryParams: {
      token: params.token,
    },
    name: "allInOne",
    protobufDecoder: (buffer) => AllInOneRes.decode(buffer) as unknown as FpResponse<PaymentOrderRes>,
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    acceptFormat: "protobuf",
  });
}