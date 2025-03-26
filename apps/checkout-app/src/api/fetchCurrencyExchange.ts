import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";
import { ExchangeTransactionRes } from "./generated/exchange_transaction";
import { SuccessResponse } from "./api.mock";
import { getStorage, setStorage } from '@/lib/storage';

export type CurrencyExchangeInfo = {
  exRate: number;
  futurePayRate: number;
  out: string;
  fetch?: "cache" | "";
};

/**
 * 获取货币汇率信息API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchCurrencyExchange(
  data: Record<string, string | number>,
  headers: Record<string, string>,
): Promise<FpResponse<CurrencyExchangeInfo>> {
  // 检查是否使用缓存
  const tokenId = (data.token as string)?.replace(/-/g, "");
  const str = getStorage("f_x_f");
  if (str && str.startsWith(tokenId) && data.fetch === "cache") {
    try {
      return SuccessResponse(JSON.parse(str.slice(tokenId.length)));
    } catch (error) {
      console.error(error);
    }
  }

  // 构建查询参数
  const queryParams = {
    in: data.inCurrency,
    out: data.outCurrency,
    markup: data.markup,
    token: data.token,
    paymentMethod: data.paymentMethod,
  };

  // 添加200ms延迟，保持与原实现一致
  const delay200 = new Promise((resolve) => setTimeout(resolve, 200));

  return Promise.all([
    createApiRequest<CurrencyExchangeInfo>({
      url: getApi() + "/checkout/exchange",
      method: "GET",
      headers: {
        Accept: "application/protobuf",
        ...headers,
      },
      queryParams,
      name: "exchange",
      protobufDecoder: (buffer) => ExchangeTransactionRes.decode(buffer) as unknown as FpResponse<CurrencyExchangeInfo>,
      timeoutCode: "40027",
      timeoutHandler: gotoTimeout,
      acceptFormat: "protobuf",
    }).then((res) => {
      // 自定义缓存处理
      if (res.success) {
        if (!res?.data?.exRate) {
          res = {
            ...res,
            data: {
              exRate: 1,
              futurePayRate: 1,
            } as CurrencyExchangeInfo,
          };
        }
        setStorage(
          "f_x_f",
          tokenId + JSON.stringify(res?.data),
        );
      }
      return res;
    }),
    delay200,
  ]).then((results) => {
    console.info(results[0]);
    return results[0];
  });
}
