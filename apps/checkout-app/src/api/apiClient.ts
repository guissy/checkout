import { FpResponse } from "./api.type";
import { printError } from "./api.error";
// import { reportResource } from "./reportArms";
import { SuccessResponse } from "./api.mock";
import { processSSEChunk } from "./deepseekParser";
import { getStorage, setStorage } from '@/lib/storage';

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ResponseFormat = "json" | "protobuf";

interface RequestOptions<T, S> {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string> | object;
  body?: S;
  queryParams?: Record<string, string | number | undefined>;
  name?: string;
  protobufDecoder?: (buffer: Uint8Array) => FpResponse<T>; // Refine return type
  errorHandler?: (error: unknown) => Promise<FpResponse<T>>;
  cacheKey?: string;
  cacheCondition?: (data: T) => boolean;
  timeoutCode?: string;
  timeoutHandler?: () => void;
  acceptFormat?: ResponseFormat;
  transformResponse?: (response: FpResponse<T>) => FpResponse<T>;
}

interface CacheOptions<T> {
  key: string;
  value: T;
  condition?: (data: T) => boolean;
}

// eslint-disable-next-lien @typescript-eslint/no-unused-vars
// interface ChatCompletionChunk {
//   id: string;
//   object: string;
//   created: number;
//   model: string;
//   system_fingerprint: string;
//   choices: Array<{
//     index: number;
//     delta: {
//       content: string;
//     };
//     logprobs: null;
//     finish_reason: null | string;
//   }>;
// }

/**
 * 创建API请求的工厂函数
 */
export function createApiRequest<T, S = Record<string, unknown> | object>(
  options: RequestOptions<T, S>
): Promise<FpResponse<T>> {
  const {
    url,
    method = "GET",
    headers = {},
    body,
    queryParams,
    name = url.split("?").shift()!.split("/").filter(Boolean).pop() ?? "api",
    protobufDecoder,
    errorHandler = printError,
    cacheKey,
    cacheCondition,
    timeoutCode = "40027",
    timeoutHandler,
    acceptFormat = "json",
    transformResponse,
  } = options;

  // 检查缓存
  if (cacheKey) {
    const cachedData = getCachedData<T>(cacheKey);
    if (cachedData && (!cacheCondition || cacheCondition(cachedData))) {
      return Promise.resolve(SuccessResponse(cachedData));
    }
  }

  // 构建查询字符串
  const queryString = queryParams
    ? new URLSearchParams(
        Object.entries(queryParams)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString()
    : "";

  // 完整URL
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  // 性能标记开始
  // let response: FpResponse<T> | null = null;
  // const startTime = Date.now();
  // let responseStatus = 0;
  performance.mark(`${name}Start`);

  // 设置Accept头
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (acceptFormat === "protobuf") {
    requestHeaders["Accept"] = "application/protobuf";
  }

  if (method === "POST" && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // 请求配置
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // 添加请求体
  if (body) {
    requestOptions.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  // 发送请求
  return fetch(fullUrl, requestOptions)
    .then(async (res) => {
      // responseStatus = res.status;
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/protobuf") && protobufDecoder) {
        const buffer = await res.arrayBuffer();
        return protobufDecoder(new Uint8Array(buffer)); // Type-safe with refined protobufDecoder
      } else if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        let mergedText = "";

        async function readStream(): Promise<FpResponse<T>> {
          while (true) {
            const { done, value } =
              (await reader?.read()) ?? { done: true, value: null };
            if (done) {
              // Assuming mergedText needs to be wrapped in FpResponse
              return SuccessResponse(mergedText as T); // Adjust based on your FpResponse structure
            }
            try {
              const chunk = new TextDecoder("utf-8").decode(value);
              const content = processSSEChunk(chunk);
              mergedText += content ?? "";
            } catch (error) {
              console.error("Error decoding chunk:", error);
            }
          }
        }

        return readStream();
      } else {
        return res.json() as Promise<FpResponse<T>>; // Assert JSON matches FpResponse<T>
      }
    })
    .then(async (res: FpResponse<T>) => {
      // 处理超时错误
      if (res.code === timeoutCode && timeoutHandler) {
        timeoutHandler();
      }

      // 应用自定义响应转换
      let transformedRes = res;
      if (transformResponse) {
        transformedRes = transformResponse(res);
      }

      // 缓存结果
      if (cacheKey && transformedRes.success) {
        setCachedData({
          key: cacheKey,
          value: transformedRes.data,
          condition: cacheCondition,
        });
      }

      // response = transformedRes;
      return transformedRes;
    })
    .catch((e) => errorHandler(e))
    // TODO: 暂时屏蔽上报
    // .finally(() => {
    //   // 性能标记结束
    //   performance.mark(`${name}End`);
    //   performance.measure(`${name}Time`, `${name}Start`, `${name}End`);
    //   const duration = performance
    //     .getEntriesByName(`${name}Time`)[0]
    //     .duration?.toFixed(0);
    //   const responseTime = Date.now();

    //   // 报告资源
    //   if (fullUrl.includes("checkoutLog/add")) {
    //     // console.log("ignore checkoutLog/add");
    //   } else {
    //     reportResource(name, {
    //       url: fullUrl,
    //       method,
    //       responseStatus,
    //       requestTime: startTime,
    //       responseTime,
    //       duration: parseInt(duration || "0"),
    //       requestHeader: JSON.stringify(headers),
    //       requestBody: body ? JSON.stringify(body) : queryString,
    //       responseMessage: JSON.stringify(response),
    //       remark: response?.msg ?? "",
    //       success: response?.success ? 1 : 0,
    //     });
    //   }
    // });
}

/**
 * 从会话存储中获取缓存数据
 */
function getCachedData<T>(key: string): T | null {
  try {
    const value = getStorage(key);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (error) {
    console.error("Error getting cached data:", error);
  }
  return null;
}

/**
 * 将数据缓存到会话存储
 */
function setCachedData<T>(options: CacheOptions<T>): void {
  try {
    const { key, value, condition } = options;
    if (!condition || condition(value)) {
      setStorage(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error setting cached data:", error);
  }
}
