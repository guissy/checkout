import { useCallback, useState } from "react";
import type {
  FormValue,
  PayMethod,
  RegularInfo,
} from "../checkout/fp-checkout-type";
import {
  createFormSchema,
  validateNeedField,
  type ValidateResult,
} from "./validateNeedField";
import fetchValidCard from "../../api/fetchValidCard";
import throttle from "lodash/throttle";

// 卡片验证缓存
interface CardValidationResult {
  success: boolean;
  msg: string;
  code: string;
}

const cardValidationCache = new Map<string, CardValidationResult>();

/**
 * 验证卡号的节流函数
 */
const throttledValidateCard = throttle(
  async (
    token: string,
    cardNo: string,
    headers: Record<string, string | undefined>,
  ): Promise<CardValidationResult> => {
    const cacheKey = `${token}_${cardNo}`;

    // 检查缓存
    if (cardValidationCache.has(cacheKey)) {
      return cardValidationCache.get(cacheKey)!;
    }

    // 发起验证请求
    const result = await fetchValidCard({ token, cardNo }, headers);

    // 存入缓存
    cardValidationCache.set(cacheKey, result);

    return result;
  },
  2000,
);

/**
 * 表单验证Hook
 */
export const useValidateResult = (
  regular: Record<string, RegularInfo> | undefined,
  currentPay: PayMethod | undefined,
  token?: string,
  headers?: Record<string, string | undefined>,
) => {
  const [validateResult, setValidateResult] = useState<ValidateResult>({});

  /**
   * 验证单个字段
   */
  const validateField = useCallback(
    (key: string, formValue: FormValue) => {
      setValidateResult((prevState) => {
        const currValidResult = validateNeedField([key], {
          formValue,
          regular,
        });
        const updatedState = { ...prevState };

        if (currValidResult[key as keyof FormValue]) {
          updatedState[key as keyof FormValue] =
            currValidResult[key as keyof FormValue];
        } else {
          delete updatedState[key as keyof FormValue];
        }

        return updatedState;
      });
    },
    [regular, currentPay],
  );

  /**
   * 验证多个字段
   */
  const validateFieldList = useCallback(
    (needFieldList: string[], formValue: FormValue) => {
      const result = validateNeedField(needFieldList, { formValue, regular });

      // 银行卡号远程验证
      const bankKey = needFieldList.find((key) =>
        key.includes("bankAccountNumber"),
      );
      if (bankKey && formValue[bankKey]) {
        const bankAccountNumber = formValue[bankKey]
          ?.toString()
          .replace(/\s+/g, "");

        // 使用 Zod schema 验证银行账号格式
        try {
          // 获取银行账号验证器
          const bankAccountSchema =
            createFormSchema().getFieldValidator("bankAccountNumber");
          // 验证银行账号
          const isBankAccountNumberValid =
            bankAccountSchema.safeParse(bankAccountNumber);

          // 验证通过，进行远程验证
          if (
            token &&
            headers &&
            bankAccountNumber &&
            isBankAccountNumberValid.success
          ) {
            throttledValidateCard(token, bankAccountNumber, headers).then(
              (res) => {
                if (!res.success && res.msg && res.code !== "10000") {
                  setValidateResult((prevState) => ({
                    ...prevState,
                    [bankKey]: res.msg,
                  }));
                }
              },
            );
          }
        } catch (error) {
          // Zod 验证错误会在前面的 validateNeedField 函数中捕获和处理
          // 这里不需要额外处理
          console.warn(error);
        }
      }

      setValidateResult(result);
      return result;
    },
    [regular, currentPay, headers, token],
  );

  /**
   * 重置验证结果
   */
  const resetValidate = useCallback(() => {
    setValidateResult({});
  }, []);

  return {
    validateResult,
    validateField,
    validateFieldList,
    resetValidate,
  };
};
