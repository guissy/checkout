import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";
import { CheckOutUrl, PaymentOrderDebug } from "./generated/payment_order";


/**
 * 获取本地会话信息API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchLocalSession(
  queryParams: PaymentOrderDebug
): Promise<FpResponse<CheckOutUrl>> {
  return createApiRequest<CheckOutUrl>({
    url: getApi() + "/checkout/localSession",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    queryParams: queryParams as unknown as Record<string, string | number>,
    name: "localSession",
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
  });
}