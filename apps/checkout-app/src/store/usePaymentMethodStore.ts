import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  PaymentOrderInfo,
  PayMethod,
} from "../app/checkout/fp-checkout-type";
import fetchPaymentList from "../api/fetchPaymentList";
import { filterCountry } from "../app/(method)/useMethodList";
import isPhone from "../utils/isPhone";
import { isDebug } from "../utils/isDev";
import { getStorageKeyWithToken } from "./index";
import type { PersistOptions } from "zustand/middleware/persist";
import type { StoreApi } from "zustand";

interface PaymentMethodState {
  currentPay: PayMethod | undefined;
  currentPayN: number;
  paymentMethods: PayMethod[];
  paymentMethodsRaw: PayMethod[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string;
  hasPaymentMethod: boolean;
  currentToken: string;

  // actions
  setCurrentPay: (method: PayMethod | undefined) => void;
  setCurrentPayN: (index: number) => void;
  loadPaymentMethods: (
    paymentOrderInfo: PaymentOrderInfo,
    token: string,
    countryCode?: string,
  ) => Promise<void>;
  reset: () => void;
}

// 定义 Zustand 持久化选项的接口
interface StoreWithPersist<T> extends StoreApi<T> {
  _persist?: {
    getOptions: () => PersistOptions<T, unknown>;
  };
}

const createPaymentMethodStore = (initialToken: string = "") =>
  create<PaymentMethodState>()(
    persist(
      (set, get) => ({
        currentPay: undefined,
        currentPayN: 0,
        paymentMethods: [],
        paymentMethodsRaw: [],
        isLoading: false,
        isLoaded: false,
        error: "",
        hasPaymentMethod: false,
        currentToken: initialToken,

        setCurrentPay: (method) => set({ currentPay: method }),

        setCurrentPayN: (index) => set({ currentPayN: index }),

        loadPaymentMethods: async (paymentOrderInfo, token, countryCode) => {
          // 保存当前token
          set({ currentToken: token });

          // 检查token是否变化，如果变化则重新加载
          if (get().currentToken !== token) {
            console.log("Token已更新，重新加载支付方式");
            set({
              isLoaded: false,
              paymentMethods: [],
              paymentMethodsRaw: [],
              currentToken: token,
            });
          }

          // 如果已经加载过且有可用支付方式，且token未变化，则不再重新加载
          const currentPaymentMethods = get().paymentMethods;
          if (
            get().isLoaded &&
            currentPaymentMethods.length > 0 &&
            get().currentToken === token
          ) {
            console.log(
              "使用缓存的支付方式列表，数量:",
              currentPaymentMethods.length,
            );
            return;
          }

          set({ isLoading: true, error: "" });

          try {
            if (isDebug()) console.info("开始获取支付方式列表");

            const res = await fetchPaymentList(
              { token, countryCode: "" },
              {
                merchantId: paymentOrderInfo?.merchantId ?? "__error__",
                appID: paymentOrderInfo?.productId ?? "__error__",
              },
              {
                holderName:
                  paymentOrderInfo?.paymentMethod?.holderName ??
                  [
                    paymentOrderInfo?.paymentMethod?.firstName,
                    paymentOrderInfo?.paymentMethod?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim(),
                firstName: paymentOrderInfo?.paymentMethod?.firstName || "",
                lastName: paymentOrderInfo?.paymentMethod?.lastName || "",
                shopperEmail:
                  paymentOrderInfo?.paymentMethod?.shopperEmail || "",
              },
            );

            if (res.code !== "40027") {
              const methodsRaw = Array.isArray(res?.data)
                ? res?.data
                : ([] as PayMethod[]);
              if (isDebug())
                console.info("已加载支付方式:", methodsRaw?.length);

              let methodsOk = methodsRaw.filter(filterCountry(countryCode));
              if (!isPhone()) {
                // PC only
                methodsOk = methodsOk.filter(
                  (it) => it.type !== "thaibanksapp",
                );
              }

              if (isDebug()) console.info("可用支付方式:", methodsOk?.length);

              const hasPaymentMethod = methodsOk?.length > 0;
              if (!hasPaymentMethod) {
                console.error("loadMethod() 错误: 未找到支付方式", methodsOk);
              }

              // 设置当前支付方式
              const currentPay = get().currentPay;
              const newCurrentPay = (() => {
                const exists = methodsOk?.some(
                  (method) => currentPay?.type === method.type,
                );
                const _default = methodsOk?.find(
                  (method) =>
                    paymentOrderInfo?.paymentMethod?.type === method.type,
                );
                const _first =
                  methodsOk.find((item) =>
                    item.supportedConsumer
                      ?.split(",")
                      .includes(countryCode as string),
                  ) ?? methodsOk?.[0];
                return exists ? currentPay : _default || _first;
              })();

              set({
                paymentMethods: methodsOk,
                paymentMethodsRaw: methodsRaw,
                isLoaded: true,
                error: "",
                hasPaymentMethod,
                currentPay: newCurrentPay,
              });
            }
          } catch (error) {
            console.error("加载支付方式失败:", error);
            set({
              error: (error as Error)?.message || "加载支付方式失败",
              hasPaymentMethod: false,
            });
          } finally {
            set({ isLoading: false });
          }
        },

        reset: () =>
          set({
            currentPay: undefined,
            currentPayN: 0,
            paymentMethods: [],
            paymentMethodsRaw: [],
            isLoading: false,
            isLoaded: false,
            error: "",
            hasPaymentMethod: false,
            currentToken: "",
          }),
      }),
      {
        name: "payment-method-storage",
        partialize: (state) => ({
          currentPay: state.currentPay,
          currentPayN: state.currentPayN,
          isLoaded: state.isLoaded,
          paymentMethods: state.paymentMethods,
          paymentMethodsRaw: state.paymentMethodsRaw,
          hasPaymentMethod: state.hasPaymentMethod,
          currentToken: state.currentToken,
        }),
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// 默认导出存储实例
export const usePaymentMethodStore = createPaymentMethodStore();

// 创建带有token的存储实例
export const createTokenBasedPaymentMethodStore = (token: string) => {
  const storeInstance = createPaymentMethodStore(token);

  // 修改存储名称，添加token前缀
  const persistOptions = (
    storeInstance as StoreWithPersist<PaymentMethodState>
  )._persist?.getOptions();
  if (persistOptions) {
    persistOptions.name = getStorageKeyWithToken(
      "payment-method-storage",
      token,
    );
  }

  return storeInstance;
};
