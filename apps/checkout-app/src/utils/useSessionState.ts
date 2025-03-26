'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function useSessionState<T>(key: string, initialValue?: T) {
  const urlParams = useSearchParams();
  const tokenId = urlParams.get('token')?.replace(/-/g, "");

  // 从 SessionStorage 中获取初始值
  const [value, setValue] = useState<T>(() => {
    // This code will only run in the browser
    if (typeof window === 'undefined') {
      return initialValue as T;
    }

    const storedValue = window.sessionStorage.getItem(key) ?? "";
    if (storedValue && tokenId && storedValue.startsWith(tokenId)) {
      try {
        return JSON.parse(storedValue.slice(tokenId.length));
      } catch (error) {
        console.error(error);
      }
    }
    return initialValue as T;
  });

  // 每次 value 改变时，将其存入 SessionStorage
  useEffect(() => {
    if (value !== undefined && typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, tokenId + JSON.stringify(value));
    }
  }, [key, value, tokenId]);

  return [value, setValue] as const;
}

export default useSessionState;
