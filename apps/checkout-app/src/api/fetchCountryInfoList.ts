import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";
import { CountryList } from "./generated/country";

export interface CountryInfo {
  id: number;
  countryId: number;
  iso2Code: string;
  countryCode: string;
  countryNameEn: string;
  countryNameCn: string;
}

/**
 * 获取国家信息列表API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchCountryInfoList(): Promise<
  FpResponse<CountryInfo[]>
> {
  return createApiRequest<CountryInfo[]>({
    url: getApi() + "/countryInfo/list",
    method: "GET",
    queryParams: {
      pageSize: 10000,
    },
    name: "countryInfo",
    protobufDecoder: (buffer) => CountryList.decode(buffer),
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    acceptFormat: "protobuf",
    cacheKey: "c_i_c",
    cacheCondition: (data) => Array.isArray(data) && data.length > 0,
  });
}