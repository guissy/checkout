import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PaymentOrderInfo } from "../app/checkout/fp-checkout-type";
import fetchOrderDetail from "../api/fetchOrderDetail";
import { decryptAES } from "../utils/cryptoAES";
import {
  getReferenceValue,
  setReferenceValue,
} from "../app/checkout/referenceUtil";
import { reportUser } from "../api/reportArms";
import { setStorage } from "../lib/storage";
import { getStorageKeyWithToken } from "./index";
import type { PersistOptions } from "zustand/middleware/persist";
import type { StoreApi } from "zustand";

// 导入货币兑换信息类型
import type { CurrencyExchangeInfo } from "../api/fetchCurrencyExchange";

interface OrderState {
  token: string;
  paymentOrderInfo: PaymentOrderInfo | null;
  isLoading: boolean;
  isInitialized: boolean;
  netError: string;
  currencyExchangeMap: Map<string, CurrencyExchangeInfo>;

  // actions
  initOrderData: (token: string) => Promise<void>;
  setNetError: (error: string) => void;
  reset: () => void;
}

// 定义 Zustand 持久化选项的接口
interface StoreWithPersist<T> extends StoreApi<T> {
  _persist?: {
    getOptions: () => PersistOptions<T, unknown>;
  };
}

const createOrderStore = (initialToken: string = "") =>
  create<OrderState>()(
    persist(
      (set, get) => ({
        token: initialToken,
        paymentOrderInfo: null,
        isLoading: false,
        isInitialized: false,
        netError: "",
        currencyExchangeMap: new Map(),

        initOrderData: async (token: string) => {
          // 如果token变化，重置已初始化状态
          if (get().token !== token) {
            console.log("Token已更新，重新初始化订单数据");
            set({
              isInitialized: false,
              paymentOrderInfo: null,
            });
          }

          // 如果已经初始化且token未变化，则不再重新初始化
          if (
            get().isInitialized &&
            get().token === token &&
            get().paymentOrderInfo
          ) {
            console.log("使用缓存的订单数据");
            return;
          }

          set({ isLoading: true, token, netError: "" });

          try {
            console.log("获取订单数据，token:", token);

            if (!token || token === "null" || token === "undefined") {
              throw new Error("Invalid token");
            }

            // 使用fetchOrderDetail获取订单数据
            const dataApi = await fetchOrderDetail({ token });
            if (!dataApi.success) {
              const errorMsg = dataApi.msg || "order not found";
              set({ netError: errorMsg });
              throw new Error(errorMsg);
            }

            if (!dataApi.data) {
              set({ netError: "order data not found" });
              throw new Error("order data not found");
            }

            const orderData = dataApi.data as unknown as string;
            const data = await decryptAES(orderData);
            const paymentOrderInfo = JSON.parse(data) as PaymentOrderInfo;

            setReferenceValue(
              paymentOrderInfo?.pspReference ||
                paymentOrderInfo?.reference ||
                "",
            );

            reportUser(getReferenceValue(), {
              amount: paymentOrderInfo?.amount?.value,
              currency: paymentOrderInfo?.amount?.currency,
              merchantId: paymentOrderInfo?.merchantId,
              productId: paymentOrderInfo?.productId,
              origin: paymentOrderInfo?.origin,
              token: token,
            });

            // 调整金额值
            paymentOrderInfo.amount.value =
              paymentOrderInfo.amount?.value / 100;

            // 设置returnUrl
            const hasHttp = paymentOrderInfo?.origin?.startsWith("http");
            const origin = hasHttp
              ? paymentOrderInfo?.origin
              : "https://" + paymentOrderInfo?.origin;
            setStorage("returnUrl", paymentOrderInfo?.returnUrl || origin);

            // 检查国家代码
            if (!paymentOrderInfo.countryCode) {
              const language = navigator.language || navigator.languages?.[0];
              paymentOrderInfo.countryCode = language?.slice(3) ?? "US";
            }

            set({
              paymentOrderInfo,
              isInitialized: true,
              netError: "",
            });
          } catch (error) {
            console.error("初始化订单数据失败:", error);
            set({
              netError: (error as Error)?.message || "获取订单数据失败",
              isInitialized: false,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        setNetError: (error: string) => set({ netError: error }),

        reset: () =>
          set({
            token: "",
            paymentOrderInfo: null,
            isLoading: false,
            isInitialized: false,
            netError: "",
            currencyExchangeMap: new Map(),
          }),
      }),
      {
        name: "order-storage",
        partialize: (state) => ({
          token: state.token,
          paymentOrderInfo: state.paymentOrderInfo,
          isInitialized: state.isInitialized,
        }),
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// 默认导出存储实例
export const useOrderStore = createOrderStore();

// 创建带有token的存储实例
export const createTokenBasedOrderStore = (token: string) => {
  const storeInstance = createOrderStore(token);

  // 修改存储名称，添加token前缀
  const persistOptions = (
    storeInstance as StoreWithPersist<OrderState>
  )._persist?.getOptions();
  if (persistOptions) {
    persistOptions.name = getStorageKeyWithToken("order-storage", token);
  }

  return storeInstance;
};
