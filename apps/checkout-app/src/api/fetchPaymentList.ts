import { createApiRequest } from "./apiClient";
import getApi from "./getApi";
import type { PayMethod, PayMethodRaw, RegularInfo, } from "../app/checkout/fp-checkout-type";
import type { FpResponse } from "./api.type";
import { SuccessResponse } from "./api.mock";
import gotoTimeout from "../utils/gotoTimeout";
import { PaymentMethodList } from "./generated/payment_method";

const resolveNeedFields = (it: { regular?: string }) => {
  let needFieldName: string[] = [];
  try {
    needFieldName = Object.entries(
      (JSON.parse(it?.regular || "{}") ?? {}) as Record<string, { need: "0" }>,
    )
      .filter(([, value]) => value?.need === "0")
      .map(([key]) => key);
  } catch (e) {
    console.error(e);
  }
  return {
    ...it,
    needFieldName,
  } as unknown as PayMethodRaw;
};

const resolveRegular = (
  it: PayMethodRaw,
  opt: {
    holderName: string;
    shopperEmail: string;
    firstName: string;
    lastName: string;
  },
) => {
  let regular: Record<string, RegularInfo> = {};
  try {
    regular = (JSON.parse(it?.regular || "{}") ?? {}) as Record<
      string,
      RegularInfo
    >;
    for (const [key] of Object.entries(regular)) {
      if (key?.split(".")?.pop() === "holderName" && opt.holderName) {
        regular[key].need = "1";
      }
      if (key?.split(".")?.pop() === "firstName" && opt.firstName) {
        regular[key].need = "1";
      }
      if (key?.split(".")?.pop() === "lastName" && opt.lastName) {
        regular[key].need = "1";
      }
      if (key?.split(".")?.pop() === "shopperEmail" && opt.shopperEmail) {
        regular[key].need = "1";
      }
    }
  } catch (e) {
    console.error(e);
  }
  return {
    ...it,
    regular,
  } as unknown as PayMethod;
};

const resolveSupportedBank = (it: Pick<PayMethod, "supportBank">) => {
  try {
    const bankList = JSON.parse(it.supportBank || "[]") as Array<{
      name: string;
      img: string;
      code: string;
    }>;
    return {
      ...it,
      supportedBankList:
        bankList
          .map((bank) => ({
            name: bank.name,
            description: "",
            bankCode: bank.code,
          }))
          .filter((bank) => bank.bankCode) ?? [],
    } as unknown as PayMethod;
  } catch (e) {
    console.error(e);
  }
  return {
    ...it,
    supportedBankList:
      it.supportBank
        ?.split(",")
        ?.map((bank) => {
          return {
            name: bank.trim(),
            description: "",
            bankCode: bank.trim(),
          };
        })
        .filter((bank) => bank.name) ?? [],
  } as unknown as PayMethod;
};

let cache: FpResponse<PayMethod[]> | null = null;

/**
 * 获取支付方式列表API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchPaymentList(
  data: Record<string, string>,
  headers: Record<string, string>,
  opt: {
    holderName: string;
    firstName: string;
    lastName: string;
    shopperEmail: string;
  },
): Promise<FpResponse<PayMethod[]>> {
  const tokenId = data.token?.replace(/-/g, "");
  const tokenCountryId = tokenId + data.countryCode;
  const str = window.sessionStorage.getItem("p_m_p");

  // 检查会话存储中的缓存
  if (str && str.startsWith(tokenCountryId)) {
    try {
      return SuccessResponse(JSON.parse(str.slice(tokenId.length + 2)));
    } catch (error) {
      console.error(error);
    }
  }

  // 检查内存缓存
  if (cache) {
    return cache;
  }

  return createApiRequest<PayMethod[]>({
    url: getApi() + "/checkout/paymentMethod",
    method: "GET",
    queryParams: {
      token: data.token,
      countryCode: data.countryCode,
    },
    headers,
    name: "paymentMethod",
    protobufDecoder: (buffer) => PaymentMethodList.decode(buffer) as unknown as  FpResponse<PayMethod[]>,
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    acceptFormat: "protobuf",
    // 自定义处理响应数据
    transformResponse: (res) => {
      if (res.success) {
        const transformedRes = {
          ...res,
          data: res.data
            .map((fields) => resolveNeedFields(fields as unknown as PayMethodRaw))
            .map((fields) => resolveRegular(fields, opt))
            .map(resolveSupportedBank),
        };

        // 处理成功后缓存结果
        if (Array.isArray(transformedRes?.data) && transformedRes.data.length > 0) {
          window.sessionStorage.setItem(
            "p_m_p",
            tokenId + (data.countryCode || "__") + JSON.stringify(transformedRes.data),
          );
          cache = transformedRes;
        }

        return transformedRes;
      }
      return res;
    },
  });
}
