import { useEffect, useState } from "react";
import getApi from "./getApi";

export const useOrderStatusStream = (reference: string) => {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const url = getApi() + `/checkout/orderStatusStream?reference=${reference}`;

    const source = new EventSource(url);

    source.onmessage = (event) => {
      // 第 85 行可能在这里
      const data = event.data; // "PENDING"
      setStatus(data); // 更新状态
    };

    source.onerror = (error) => {
      console.error("SSE Error:", error);
      source.close();
    };

    return () => {
      source.close(); // 组件卸载时关闭连接
    };
  }, [reference]);

  return status;
};
