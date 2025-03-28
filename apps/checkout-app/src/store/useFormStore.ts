import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  FormValue,
  PaymentOrderInfo,
  PayMethod,
  PayOrder,
} from "../app/checkout/fp-checkout-type";
import { getStorageKeyWithToken } from "./index";
import { resolveValue, ValidateResult } from "../app/(form)/validateNeedField";
import fetchPaymentOrder, { PaymentOrderRes } from "../api/fetchPaymentOrder";
import removeUndefinedProperties from "../utils/removeUndefinedProperties";
import merge from "lodash/merge";
import lodashSet from "lodash/set";
import { setFormElementsDisabled } from "../utils/formMouse";
import { reportError, reportEvent } from "../api/reportArms";
import { isDebug } from "../utils/isDev";
import { i18n } from "@lingui/core";
import { getStorage, removeStorage, setStorage } from "../lib/storage";
import { getReferenceValue } from "../app/checkout/referenceUtil";
import AlipayType from "../app/(method)/AlipayType";
import type { CountryInfo } from "../api/fetchCountryInfoList";
import { StoreApi } from "zustand/vanilla";
import type { PersistOptions } from "zustand/middleware/persist";

// 常量 - providerId为number类型
const NMI_PROVIDER_ID = 158; // 假设的数值，请替换为实际值
const EASYLINK_PROVIDER_ID = 240; // 假设的数值，请替换为实际值

// 定义表单字段值类型
type FormFieldValue = string | undefined;

interface FormState {
  formValue: FormValue;
  submitting: boolean;
  redirecting: boolean;
  validated: boolean;
  currentToken: string;
  payOrder?: PayOrder; // 新增payOrder状态

  // actions
  setFormValue: (formValue: Partial<FormValue>) => void;
  updateFormField: (key: keyof FormValue, value: FormFieldValue) => void;
  setSubmitting: (submitting: boolean) => void;
  setRedirecting: (redirecting: boolean) => void;
  setValidated: (validated: boolean) => void;
  setToken: (token: string) => void;
  setPayOrder: (payOrder: PayOrder | undefined) => void; // 新增设置payOrder的方法
  handleFormSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    options: {
      token: string;
      currentPay?: PayMethod;
      paymentOrderInfo?: PaymentOrderInfo;
      country?: CountryInfo;
      currency: string;
      outAmount: string;
      validateFieldList: (
        keys: string[],
        formValue: FormValue,
      ) => ValidateResult;
      navigate: (url: string) => void;
      setNetError: (msg: string) => void;
      goToSuccess: (data: PaymentOrderRes) => void;
    },
  ) => Promise<void>;
  reset: () => void;
}

// 定义 Zustand 持久化选项的接口
interface StoreWithPersist<T> extends StoreApi<T> {
  _persist?: {
    getOptions: () => PersistOptions<T, unknown>;
  };
}

const createFormStore = (initialToken: string = "") =>
  create<FormState>()(
    persist(
      (set, get) => ({
        formValue: {} as FormValue,
        submitting: false,
        redirecting: false,
        validated: false,
        currentToken: initialToken,
        payOrder: undefined, // 初始化payOrder为undefined

        setFormValue: (newFormValue) =>
          set({ formValue: { ...get().formValue, ...newFormValue } }),

        updateFormField: (key, value) =>
          set({
            formValue: {
              ...get().formValue,
              [key]: value,
            },
          }),

        setSubmitting: (submitting) => set({ submitting }),

        setRedirecting: (redirecting) => set({ redirecting }),

        setValidated: (validated) => set({ validated }),

        setToken: (token) => {
          // 检查token是否变化
          if (get().currentToken !== token && token) {
            console.log("Token已更新，重置表单状态");
            set({
              formValue: {} as FormValue,
              currentToken: token,
              payOrder: undefined, // 重置payOrder
            });
          } else {
            set({ currentToken: token });
          }
        },

        setPayOrder: (payOrder) => set({ payOrder }), // 设置payOrder的方法

        handleFormSubmit: async (e, options) => {
          e.preventDefault();
          e.stopPropagation();

          const {
            token,
            currentPay,
            paymentOrderInfo,
            country,
            currency,
            outAmount,
            validateFieldList,
            navigate,
            setNetError,
            goToSuccess,
          } = options;

          // 获取当前状态
          const state = get();
          const { formValue } = state;

          // 防止重复提交
          if (state.submitting || state.redirecting) {
            console.error("已经在提交中!");
            return;
          }

          try {
            set({ submitting: true });

            const btn = document.querySelector("#pay-btn")?.textContent;
            void reportEvent("form_submit", {
              btn: btn?.replace(/\n/g, "")?.trim(),
              value: outAmount,
            });

            if (isDebug()) console.log("表单提交中...");

            // 验证字段
            const validateResult = validateFieldList(
              currentPay?.needFieldName ?? [],
              formValue,
            );
            if (Object.keys(validateResult).length > 0) {
              console.error("验证错误:", validateResult);
              return;
            }

            if (!paymentOrderInfo?.amount?.value) {
              console.error("金额为空");
              return;
            }

            setNetError("");
            setFormElementsDisabled(e.target as HTMLFormElement, true);

            // 准备支付数据
            const pay = {
              paymentMethod: {
                type: currentPay?.type,
                transactionType: currentPay?.transactionType,
                markup: currentPay?.markup,
                holderName: undefined as unknown as string,
                payToken: undefined as unknown as string,
                signData: undefined as unknown as string,
              },
              lineItems: undefined as unknown as [
                { name: string; description: string },
              ],
              countryCode: country?.iso2Code?.toString(),
              processingCurrency: currency,
              amount: {
                ...paymentOrderInfo?.amount,
                value: (paymentOrderInfo?.amount?.value || 0) * 100,
              },
            };

            // 处理带点的字段名
            let dotKeyObj = {} as { paymentMethod?: { type?: string } };
            const _formValue = resolveValue(formValue, currentPay);

            if (currentPay?.needFieldName?.some((it) => it.includes("."))) {
              dotKeyObj = (currentPay?.needFieldName ?? []).reduce(
                (acc, cur) => {
                  let value = _formValue[cur];
                  if (
                    cur.includes("telephoneNumber") &&
                    _formValue["callingCode"]
                  ) {
                    const callingCode = (
                      _formValue["callingCode"] as string
                    )?.replace(/^\+/, "");
                    if (
                      !["konbini", "payeasy"].includes(currentPay?.type || "")
                    ) {
                      value = callingCode + _formValue[cur];
                    }
                  }
                  lodashSet(acc, cur, value);
                  return acc;
                },
                {},
              );
            }

            // 特殊支付方式处理
            // 判断providerId是否为特定值
            if (currentPay?.providerId === NMI_PROVIDER_ID) {
              if (currentPay?.type === "cardsus") {
                pay.paymentMethod.holderName = `${formValue["paymentMethod.firstName"]} ${formValue["paymentMethod.lastName"]}`;
              } else if (currentPay?.type === "googlepayus") {
                const googlePayToken = getStorage("gpt") ?? "";
                console.warn("Google Pay token:", googlePayToken);
                pay.paymentMethod.payToken = googlePayToken;
              }
            }

            if (
              paymentOrderInfo?.paymentMethod?.firstName &&
              paymentOrderInfo?.paymentMethod?.lastName &&
              !paymentOrderInfo?.paymentMethod?.holderName
            ) {
              pay.paymentMethod.holderName = `${paymentOrderInfo.paymentMethod.firstName} ${paymentOrderInfo.paymentMethod.lastName}`;
            }

            if (currentPay?.providerId === EASYLINK_PROVIDER_ID) {
              pay.lineItems = [
                {
                  name: paymentOrderInfo?.productName || "",
                  description: paymentOrderInfo?.productDetail || "",
                },
              ];
            }

            // 特殊支付类型处理
            if (
              currentPay?.type === "koreancard" ||
              currentPay?.type === "creditcardvm"
            ) {
              setStorage(
                "payorder",
                JSON.stringify({
                  paymentOrderInfo,
                  dotKeyObj: {
                    paymentMethod: {
                      ...dotKeyObj?.paymentMethod,
                      ...paymentOrderInfo?.paymentMethod,
                    },
                  },
                }),
              );
              navigate(
                `/payorder?reference=${getReferenceValue()}&token=${token}`,
              );
              return;
            }

            // 准备最终表单数据
            const formData = {
              ...removeUndefinedProperties(
                merge({}, paymentOrderInfo, pay, dotKeyObj, {
                  returnUrl: paymentOrderInfo?.returnUrl,
                }),
              ),
            } as Record<string, unknown>;

            if (isDebug()) console.log("表单数据:", formData);

            void reportEvent("token", {
              token: `${paymentOrderInfo?.merchantId} ${paymentOrderInfo?.productId} ${token}`,
            });

            // 发送支付请求
            const res = await fetchPaymentOrder(
              formData,
              {
                merchantId: paymentOrderInfo?.merchantId || "",
                appID: paymentOrderInfo?.productId || "",
                providerId: String(currentPay?.providerId || ""),
              },
              { token },
            );

            if (isDebug()) console.log("支付订单响应:", res);

            const status = res.data?.resultCode;
            if (
              status === "SUCCEED" ||
              status === "SUCCESS" ||
              status === "PENDING"
            ) {
              if (isDebug()) console.log("支付订单创建成功");

              const payOrder = {
                reference: paymentOrderInfo.reference,
                value: paymentOrderInfo.amount.value as number,
                currency: paymentOrderInfo.amount.currency,
                exValue: parseFloat(outAmount || "0"),
                exCurrency: currency as string,
                payType: currentPay?.type as string,
                payName: currentPay?.platformName as string,
                expiresAt: new Date().toUTCString(),
              };

              // 使用zustand存储payOrder，替换原来的Cookie
              set({ payOrder });

              // 处理重定向
              if (res.data?.action?.type === "redirect") {
                set({ redirecting: true });

                if (
                  res.data?.action?.url ||
                  res.data?.action?.schemeUrl ||
                  res.data?.action?.applinkUrl
                ) {
                  removeStorage("o_d_o");

                  if (AlipayType.includes(currentPay?.type || "")) {
                    const search = (res.data?.action?.payUrl || "")?.split(
                      "?",
                    )?.[1];
                    navigate(`/alipayPlus?${search}&token=${token}`);
                  } else if (
                    res.data?.action?.url?.includes("/payorder?reference=")
                  ) {
                    const ref = res.data.action.url.split(
                      "/payorder?reference=",
                    )[1];
                    navigate(`/payorder?reference=${ref}&token=${token}`);
                  } else {
                    window.location.href = res.data?.action?.url || "";
                  }
                } else {
                  goToSuccess(res.data);
                }
              }
              // 处理3DS认证
              else if (
                ["pin", "avs", "sms"].includes(res.data?.action?.type as string)
              ) {
                navigate(
                  `/ThreeDSAuth?token=${token}&reference=${paymentOrderInfo?.reference}`,
                );
              }
              // 处理二维码
              else if (res.data?.action?.type === "qrcode") {
                window.history.pushState(
                  {},
                  "",
                  window.location.href + "#qrcode",
                );
              }
              // 处理USSD
              else if (
                status === "PENDING" &&
                res.data?.action?.type === "ussd"
              ) {
                navigate(`/complete?reference=${getReferenceValue()}`);
              }
              // 其他成功情况
              else {
                goToSuccess(res.data);
              }
            } else {
              // 处理失败情况
              const errorResMsg =
                res.data?.refusalReason ||
                res.data?.resultCode ||
                res.msg ||
                i18n.t("payment.failure");
              console.error("支付失败:", errorResMsg);
              setNetError(errorResMsg);
              void reportError(
                "payment_failure",
                res.code,
                errorResMsg,
                formData,
              );
            }
          } catch (error) {
            console.error("支付错误:", error);
            setNetError(i18n.t("payment.network_error"));
          } finally {
            set({ submitting: false });
            setFormElementsDisabled(e.target as HTMLFormElement, false);
          }
        },

        reset: () =>
          set({
            formValue: {} as FormValue,
            submitting: false,
            redirecting: false,
            validated: false,
            currentToken: "",
            payOrder: undefined, // 重置payOrder
          }),
      }),
      {
        name: "form-storage",
        partialize: (state) => ({
          formValue: state.formValue,
          currentToken: state.currentToken,
          payOrder: state.payOrder, // 持久化payOrder
        }),
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

// 默认导出存储实例
export const useFormStore = createFormStore();

// 创建带有token的存储实例
export const createTokenBasedFormStore = (token: string) => {
  const storeInstance = createFormStore(token);

  // 修改存储名称，添加token前缀
  const persistOptions = (
    storeInstance as StoreWithPersist<FormState>
  )._persist?.getOptions();
  if (persistOptions) {
    persistOptions.name = getStorageKeyWithToken("form-storage", token);
  }

  return storeInstance;
};
