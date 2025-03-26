import { createApiRequest } from "./apiClient";
import { FpResponse } from "./api.type";
import getApi from "./getApi";
import { PayMethod } from "../app/checkout/fp-checkout-type";

export interface PaymentInfoParams {
  token: string;
  reference: string;
}

export type PaymentInfo = {
  action: {
    paymentMethodType: string;
    qrCode: string;
    schemeUrl: string;
    applinkUrl: string;
    url: string;
    payUrl: string;
    method: string;
    type: string;
  };
  amount: {
    currency: string;
    value: number;
  };
  merchantReference: string;
  pspReference: string;
  reference: string;
  resultCode: string;
  providerReference: string;
  currentPay: PayMethod;
  order: {
    amount: {
      currency: string;
      value: number;
    };
  };
};

/**
 * 获取支付信息API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchPaymentInfo(
  data: PaymentInfoParams,
  ctx = "",
): Promise<FpResponse<PaymentInfo>> {
  return createApiRequest<PaymentInfo>({
    url: getApi() + "/checkout/paymentInfo",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      reference: data.reference,
    },
    body: data,
    name: `paymentInfo${ctx}`,
  });
}