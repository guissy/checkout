import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import type { PaymentOrderRes } from "./fetchPaymentOrder";
import gotoTimeout from "../utils/gotoTimeout";

export interface OtpParams {
  message: string;
}

type OtpRes = {
  resultCode: string;
  action: PaymentOrderRes["action"];
  refusalReason: PaymentOrderRes["refusalReason"];
  pspReference: PaymentOrderRes["pspReference"];
};

/**
 * OTP验证API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchOtp(
  url: string,
  data: OtpParams,
  headers: Record<string, string>,
): Promise<FpResponse<OtpRes>> {
  return createApiRequest<OtpRes>({
    url: `${url}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: data,
    queryParams: {
      checkoutToken: headers.token,
    },
    name: url.split("?").shift()!.split("/").filter(Boolean).pop() ?? "otp",
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
  });
}