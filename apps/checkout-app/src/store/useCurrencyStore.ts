import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import fetchCurrencyExchange, {
  CurrencyExchangeInfo,
} from "../api/fetchCurrencyExchange";
import type {
  PaymentOrderInfo,
  PayMethod,
} from "../app/checkout/fp-checkout-type";
import { truncateCurrency } from "checkout-ui";
import { getStorageKeyWithToken } from "./index";
import type { PersistOptions } from "zustand/middleware/persist";
import type { StoreApi } from "zustand";

interface CurrencyState {
  currency: string;
  outAmount: string;
  isLoading: boolean;
  error: string;
  currencyExchangeOpen: boolean;
  currencyOpen: boolean;
  exchangeMap: Map<string, CurrencyExchangeInfo>;
  currentToken: string;

  // actions
  setCurrency: (currency: string) => void;
  setOutAmount: (amount: string) => void;
  setCurrencyExchangeOpen: (open: boolean) => void;
  setCurrencyOpen: (open: boolean) => void;
  fetchCurrencyExchange: (
    token: string,
    currentPay: PayMethod,
    paymentOrderInfo: PaymentOrderInfo,
  ) => Promise<void>;
  reset: () => void;
}

// 定义 Zustand 持久化选项的接口
interface StoreWithPersist<T> extends StoreApi<T> {
  _persist?: {
    getOptions: () => PersistOptions<T, unknown>;
  };
}

const createCurrencyStore = (initialToken: string = "") =>
  create<CurrencyState>()(
    persist(
      (set, get) => ({
        currency: "",
        outAmount: "-",
        isLoading: false,
        error: "",
        currencyExchangeOpen: false,
        currencyOpen: false,
        exchangeMap: new Map(),
        currentToken: initialToken,

        setCurrency: (currency) => set({ currency }),

        setOutAmount: (amount) => set({ outAmount: amount }),

        setCurrencyExchangeOpen: (open) => set({ currencyExchangeOpen: open }),

        setCurrencyOpen: (open) => set({ currencyOpen: open }),

        fetchCurrencyExchange: async (token, currentPay, paymentOrderInfo) => {
          // 保存当前token
          set({ currentToken: token });

          // 检查token是否变化
          if (get().currentToken !== token) {
            console.log("Token已更新，重置货币状态");
            set({
              currency: "",
              outAmount: "-",
              exchangeMap: new Map(),
              currentToken: token,
            });
          }

          const currency = get().currency;
          if (!currentPay || !currency || !paymentOrderInfo) return;

          set({ isLoading: true, error: "" });

          try {
            // 如果货币相同，直接设置金额
            if (currency === paymentOrderInfo.amount.currency) {
              set({
                outAmount: paymentOrderInfo.amount.value.toString(),
                isLoading: false,
              });
              return;
            }

            // 处理货币兑换
            const res = await fetchCurrencyExchange(
              {
                token,
                markup: currentPay.markup || 0,
                inCurrency: paymentOrderInfo.amount.currency,
                outCurrency: currency,
                paymentMethod: currentPay.type,
                fetch: "",
              },
              {},
            );

            if (res.success && res.data) {
              // 更新汇率信息
              const exchangeMap = new Map(get().exchangeMap);
              exchangeMap.set(res.data.out, res.data);

              // 计算转换金额
              const outAmountValue =
                parseFloat(res.data.futurePayRate.toString()) *
                parseFloat(paymentOrderInfo.amount.value.toString());

              set({
                exchangeMap,
                outAmount: isNaN(outAmountValue)
                  ? "-"
                  : truncateCurrency(outAmountValue, currency).toString(),
              });
            } else {
              throw new Error(res.msg || "货币兑换失败");
            }
          } catch (error) {
            console.error("Currency exchange failed:", error);
            set({
              error: (error as Error)?.message || "货币兑换失败",
              outAmount: "-",
            });
          } finally {
            set({ isLoading: false });
          }
        },

        reset: () =>
          set({
            currency: "",
            outAmount: "-",
            isLoading: false,
            error: "",
            currencyExchangeOpen: false,
            currencyOpen: false,
            exchangeMap: new Map(),
            currentToken: "",
          }),
      }),
      {
        name: "currency-storage",
        partialize: (state) => ({
          currency: state.currency,
          currentToken: state.currentToken,
        }),
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// 默认导出存储实例
export const useCurrencyStore = createCurrencyStore();

// 创建带有token的存储实例
export const createTokenBasedCurrencyStore = (token: string) => {
  const storeInstance = createCurrencyStore(token);

  // 修改存储名称，添加token前缀
  const persistOptions = (
    storeInstance as StoreWithPersist<CurrencyState>
  )._persist?.getOptions();
  if (persistOptions) {
    persistOptions.name = getStorageKeyWithToken("currency-storage", token);
  }

  return storeInstance;
};
