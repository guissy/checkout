"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useOrderStore } from "./useOrderStore";
import { usePaymentMethodStore } from "./usePaymentMethodStore";
import { useCurrencyStore } from "./useCurrencyStore";
import { useFormStore } from "./useFormStore";

interface StoreContextProps {
  isInitialized: boolean;
  isLoading: boolean;
  error: string;
  currentToken: string | null;
}

const StoreContext = createContext<StoreContextProps>({
  isInitialized: false,
  isLoading: false,
  error: "",
  currentToken: null,
});

export const useStore = () => useContext(StoreContext);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // 获取存储键名
  useEffect(() => {
    if (tokenParam && tokenParam !== currentToken) {
      console.log("Token已更新:", tokenParam);
      setCurrentToken(tokenParam);

      // 修改存储键名（通过sessionStorage直接修改键名）
      if (currentToken && currentToken !== tokenParam) {
        console.log("Token变化，重置状态");
        useFormStore.getState().setToken(tokenParam);
      }
    }
  }, [tokenParam, currentToken]);

  // 获取所有状态仓库
  const {
    initOrderData,
    isInitialized: orderInitialized,
    isLoading: orderLoading,
    netError: orderError,
    paymentOrderInfo,
    token: storeToken,
  } = useOrderStore();

  const {
    loadPaymentMethods,
    isLoaded: methodsLoaded,
    isLoading: methodsLoading,
    error: methodsError,
    paymentMethods,
  } = usePaymentMethodStore();

  const { error: currencyError } = useCurrencyStore();

  // 合并状态
  const isInitialized = orderInitialized && methodsLoaded;
  const isLoading = orderLoading || methodsLoading;
  const error = orderError || methodsError || currencyError;

  // 初始化订单数据
  useEffect(() => {
    if (tokenParam && (!orderInitialized || storeToken !== tokenParam)) {
      console.log("初始化订单数据...");
      initOrderData(tokenParam);
    } else if (orderInitialized) {
      console.log("订单数据已初始化，Token:", storeToken);
    }
  }, [tokenParam, orderInitialized, initOrderData, storeToken]);

  // 当订单数据初始化完成后，加载支付方式
  useEffect(() => {
    if (orderInitialized && paymentOrderInfo && tokenParam) {
      if (!methodsLoaded || paymentMethods.length === 0) {
        console.log("加载支付方式列表...");
        loadPaymentMethods(
          paymentOrderInfo,
          tokenParam,
          paymentOrderInfo.countryCode,
        );
      } else {
        console.log("使用缓存的支付方式列表，数量:", paymentMethods.length);
      }
    }
  }, [
    orderInitialized,
    paymentOrderInfo,
    methodsLoaded,
    loadPaymentMethods,
    tokenParam,
    paymentMethods.length,
  ]);

  // 当所有数据加载完成后，标记应用程序为已初始化
  useEffect(() => {
    if (orderInitialized && methodsLoaded && !isAppInitialized) {
      console.log("应用程序初始化完成");
      setIsAppInitialized(true);
    }
  }, [orderInitialized, methodsLoaded, isAppInitialized]);

  // 提供状态上下文
  const contextValue = useMemo(
    () => ({
      isInitialized,
      isLoading,
      error,
      currentToken,
    }),
    [isInitialized, isLoading, error, currentToken],
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};
