// utils/storage.ts
import Cookies from 'js-cookie';

type StorageType = 'cookie' | 'local' | 'session';
type StorageOptions = {
  type?: StorageType;
  expires?: number | Date; // 仅对 cookie 有效
  path?: string;          // 仅对 cookie 有效
  secure?: boolean;       // 仅对 cookie 有效
};

/**
 * 通用存储函数
 * @param key 存储键名
 * @param value 存储值
 * @param options 存储选项
 */
export function setStorage<T=string>(
  key: string,
  value: T,
  options: StorageOptions = { type: 'cookie' }
): void {
  // 服务端直接返回
  if (typeof window === 'undefined') return;

  const serializedValue = JSON.stringify(value);
  switch (options.type) {
    case 'local':
      window.localStorage.setItem(key, serializedValue);
      break;
    case 'session':
      window.sessionStorage.setItem(key, serializedValue);
      break;
    case 'cookie':
    default:
      Cookies.set(key, serializedValue, {
        expires: options.expires,
        path: options.path,
        secure: options.secure,
      });
      break;
  }
}

/**
 * 通用读取函数
 * @param key 存储键名
 * @param options 存储选项
 * @returns 存储的值或 null
 */
export function getStorage<T=string>(
  key: string,
  options: Pick<StorageOptions, 'type'> = { type: 'cookie' }
): T | null {
  // 服务端直接返回 null
  if (typeof window === 'undefined') return null;

  try {
    let storedValue: string | null | undefined;

    switch (options.type) {
      case 'local':
        storedValue = window.localStorage.getItem(key);
        break;
      case 'session':
        storedValue = window.sessionStorage.getItem(key);
        break;
      case 'cookie':
      default:
        storedValue = Cookies.get(key);
        break;
    }

    return storedValue ? JSON.parse(storedValue) : null;
  } catch (error) {
    console.error('Failed to parse stored value:', error);
    return null;
  }
}

/**
 * 通用删除函数
 * @param key 存储键名
 * @param options 存储选项
 */
export function removeStorage(
  key: string,
  options: Pick<StorageOptions, 'type'> = { type: 'cookie' }
): void {
  if (typeof window === 'undefined') return;

  switch (options.type) {
    case 'local':
      window.localStorage.removeItem(key);
      break;
    case 'session':
      removeStorage(key);
      break;
    case 'cookie':
    default:
      Cookies.remove(key);
      break;
  }
}
