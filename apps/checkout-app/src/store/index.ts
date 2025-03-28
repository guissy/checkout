import { useOrderStore } from "./useOrderStore";
import { usePaymentMethodStore } from "./usePaymentMethodStore";
import { useFormStore } from "./useFormStore";
import { useCurrencyStore } from "./useCurrencyStore";

export { useOrderStore } from "./useOrderStore";
export { usePaymentMethodStore } from "./usePaymentMethodStore";
export { useFormStore } from "./useFormStore";
export { useCurrencyStore } from "./useCurrencyStore";
export { StoreProvider, useStore } from "./StoreProvider";

// 生成带有token的存储键名称
export const getStorageKeyWithToken = (
  baseKey: string,
  token?: string,
): string => {
  if (!token) return baseKey;
  // 使用前8位作为标识符，避免键名过长
  const tokenPrefix = token.slice(0, 8);
  return `${baseKey}-${tokenPrefix}`;
};

// 根据token清除特定的存储项
export const clearStorageByToken = (token: string): void => {
  const tokenPrefix = token.slice(0, 8);
  const keys = [
    `order-storage-${tokenPrefix}`,
    `payment-method-storage-${tokenPrefix}`,
    `form-storage-${tokenPrefix}`,
    `currency-storage-${tokenPrefix}`,
  ];

  keys.forEach((key) => {
    sessionStorage.removeItem(key);
  });

  console.log(`已清除token为${tokenPrefix}的所有存储`);
};

// 重置所有状态
export const resetAllStores = () => {
  useOrderStore.getState().reset();
  usePaymentMethodStore.getState().reset();
  useFormStore.getState().reset();
  useCurrencyStore.getState().reset();
};
