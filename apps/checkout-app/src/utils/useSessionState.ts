'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { getStorage } from '@/lib/storage';
// import { getStorage, setStorage } from '@/lib/storage';

// function useSessionState<T>(key: string, initialValue?: T) {
//   const urlParams = useSearchParams();
//   const tokenId = urlParams.get('token')?.replace(/-/g, "");
//
//   // 从 SessionStorage 中获取初始值
//   const [value, setValue] = useState<T>(() => {
//     // This code will only run in the browser
//     if (typeof window === 'undefined') {
//       return initialValue as T;
//     }
//
//     const storedValue = getStorage(key) ?? "";
//     if (storedValue && tokenId && storedValue.startsWith(tokenId)) {
//       try {
//         return JSON.parse(storedValue.slice(tokenId.length));
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     return initialValue as T;
//   });
//
//   // 每次 value 改变时，将其存入 SessionStorage
//   useEffect(() => {
//     if (value !== undefined && typeof window !== 'undefined') {
//       setStorage(key, tokenId + JSON.stringify(value));
//     }
//   }, [key, value, tokenId]);
//
//   return [value, setValue] as const;
// }

function useCookieState<T>(key: string, initialValue?: T, options?: {
  expires?: number | Date; // 过期时间（天数或Date对象）
  path?: string;          // cookie路径
  domain?: string;        // cookie域名
  secure?: boolean;       // 是否只通过HTTPS传输
  sameSite?: 'strict' | 'lax' | 'none'; // SameSite属性
}) {
  const urlParams = useSearchParams();
  const tokenId = urlParams.get('token')?.replace(/-/g, "") || getStorage('token')?.replace(/-/g, "");

  // 从 Cookie 中获取初始值
  const [value, setValue] = useState<T>(() => {
    // 服务端渲染时返回初始值
    if (typeof window === 'undefined') {
      return initialValue as T;
    }

    const cookieValue = Cookies.get(key);
    if (cookieValue && tokenId && cookieValue.startsWith(tokenId)) {
      try {
        return JSON.parse(cookieValue.slice(tokenId.length));
      } catch (error) {
        console.error('Failed to parse cookie value:', error);
      }
    }
    return initialValue as T;
  });

  // 每次 value 改变时，更新 Cookie
  useEffect(() => {
    if (value !== undefined) {
      const cookieValue = tokenId + JSON.stringify(value);
      Cookies.set(key, cookieValue, {
        expires: options?.expires ?? 7, // 默认7天过期
        path: options?.path ?? '/',     // 默认根路径
        ...options
      });
    }
  }, [key, value, tokenId, options]);


  return [value, setValue] as const;
}

export default useCookieState;
// export default useSessionState;
