import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";

export interface BankCodeParams {
  token: string;
  cardNo: string;
}

/**
 * 验证卡号的API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchValidCard(
  data: BankCodeParams,
  headers: Record<string, string | undefined> = {}
): Promise<FpResponse<unknown>> {
  return createApiRequest<unknown>({
    url: getApi() + "/checkout/validCard",
    method: "GET",
    queryParams: {
      token: data.token,
      cardNo: data.cardNo,
    },
    headers,
    name: "validCard",
  });
} 