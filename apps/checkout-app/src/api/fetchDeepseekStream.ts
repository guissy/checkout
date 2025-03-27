import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";

/**
 * 获取日志（流式响应版本）
 * @param prompt 提示文本
 * @param onChunk 接收到新文本块时的回调函数
 */
export default async function fetchDeepseekStream(
  prompt: string,
  onChunk: (text: string, done: boolean) => void
): Promise<FpResponse<string>> {
  return createApiRequest<string>({
    url: getApi() + "/deepseek",
    method: "POST",
    body: {
      prompt
    },
    name: "deepseek-stream",
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    cacheKey: "deepseek",
    cacheCondition: () => false,
    transformResponse: (response) => {
      // 这个函数在流式处理完成后被调用，此时已经通过onChunk回调处理了所有数据
      return response;
    },
    // 自定义流处理函数
    streamHandler: async (reader) => {
      let mergedText = "";
      let lastUpdateTime = 0;
      const updateInterval = 150; // 更新间隔，单位毫秒，可以根据需要调整
      let pendingUpdate = false;
      
      // 节流函数，控制更新频率
      const throttledUpdate = (text: string, isDone: boolean) => {
        const now = Date.now();
        if (isDone) {
          // 流结束时，立即更新最终结果
          onChunk(text, true);
          return;
        }
        
        if (!pendingUpdate && (now - lastUpdateTime >= updateInterval)) {
          // 达到更新间隔，执行更新
          onChunk(text, false);
          lastUpdateTime = now;
        } else if (!pendingUpdate) {
          // 设置延迟更新
          pendingUpdate = true;
          setTimeout(() => {
            onChunk(text, false);
            lastUpdateTime = Date.now();
            pendingUpdate = false;
          }, updateInterval - (now - lastUpdateTime));
        }
      };
      
      while (true) {
        const { done, value } = await reader.read() || { done: true, value: null };
        
        if (done) {
          // 流结束，通知完成
          throttledUpdate(mergedText, true);
          break;
        }
        
        try {
          const chunk = new TextDecoder("utf-8").decode(value);
          const lines = chunk.split("\n");
          let contentUpdated = false;
          
          for (const line of lines) {
            // 只处理以"data: "开头的行
            if (line.startsWith("data: ")) {
              try {
                // 移除"data: "前缀并解析JSON
                const jsonData = line.replace(/^data: /, "");
                if (jsonData !== "[DONE]") {
                  const data = JSON.parse(jsonData);
                  // 提取内容（如果存在）
                  const content = data?.choices[0]?.delta?.content || "";
                  if (content) {
                    mergedText += content;
                    contentUpdated = true;
                  }
                } else {
                  // 流结束标记
                  throttledUpdate(mergedText, true);
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          }
          
          // 只有在内容有更新时才触发节流更新
          if (contentUpdated) {
            throttledUpdate(mergedText, false);
          }
        } catch (error) {
          console.error("Error decoding chunk:", error);
        }
      }
      
      return mergedText;
    }
  });
}