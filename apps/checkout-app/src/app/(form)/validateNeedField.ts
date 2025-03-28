import type { FormValue, PayMethod, RegularInfo, SchemaField } from '../checkout/fp-checkout-type';
import { i18n } from '@lingui/core';
import React, { useState } from 'react';
import { isDebug } from '../../utils/isDev';
import { formatNumberSpaced } from '../../utils/formatByTemplate';
import fetchValidCard from '../../api/fetchValidCard';
import throttle from 'lodash/throttle';
import { z } from 'zod';

/**
 * 使用 Zod 定义表单字段验证规则
 */
export const createFormSchema = () => {
  // 基础字段验证
  const baseFields = {
    // 个人信息字段
    holderName: z.string().min(1, {
      message: i18n._({ id: 'form.field_required' }) || "持卡人姓名不能为空"
    }),
    firstName: z.string().min(1, {
      message: i18n._({ id: 'form.field_required' }) || "名字不能为空"
    }),
    lastName: z.string().min(1, {
      message: i18n._({ id: 'form.field_required' }) || "姓氏不能为空"
    }),
    
    // 联系方式字段
    email: z.string().email({
      message: i18n._({
        id: 'form.email_invalid',
        message: 'Email is invalid!'
      }) || "请输入有效的邮箱地址"
    }),
    telephoneNumber: z.string().min(1, {
      message: i18n._({ id: 'form.field_required' }) || "电话号码不能为空"
    }),
    
    // 位置信息
    country: z.string().min(1, {
      message: i18n._({ id: 'form.field_required' }) || "国家不能为空"
    }),
    
    // 信用卡字段
    cardNumber: z.string()
      .regex(/^\d{14,19}$/, {
        message: i18n._({
          id: 'form.card_number_invalid',
          message: 'Card number is invalid!'
        }) || "请输入有效的卡号 (14-19位数字)"
      }),
      
    // 银行账号字段
    bankAccountNumber: z.string()
      .regex(/^\d{14,19}$/, {
        message: i18n._({
          id: 'form.card_number_invalid',
          message: 'Card number is invalid!'
        }) || "请输入有效的银行账号 (14-19位数字)"
      }),
      
    // 安全码/CVV/CVC (统一为一个字段)
    cvv: z.string()
      .regex(/^\d{3,4}$/, {
        message: i18n._({
          id: 'form.cvv_invalid',
          message: 'CVV is invalid!'
        }) || "请输入有效的CVV (3-4位数字)"
      }),
      
    // 到期日期相关字段
    expiryMonth: z.string()
      .regex(/^(0[1-9]|1[0-2])$/, {
        message: i18n._({
          id: 'form.month_invalid',
          message: 'Month is invalid!'
        }) || "请输入有效的到期月份 (01-12)"
      }),
      
    // 使用2位年份格式
    expiryYear: z.string()
      .regex(/^\d{2}$/)
      .refine((value) => {
        const currentYear = new Date().getFullYear();
        const maxYear = (currentYear + 10) - 2000;
        return parseInt(value) <= maxYear;
      }, {
        message: i18n._({
          id: 'form.year_invalid',
          message: 'Year is invalid!'
        }) || "请输入有效的到期年份"
      }),
  };
  
  // 创建自定义验证模式
  return {
    baseSchema: z.object(baseFields).partial(),
  
    
    // 获取单个字段的验证器
    getFieldValidator: (fieldKey: string) => {
      return baseFields[fieldKey as keyof typeof baseFields] || 
             z.string().min(1, { 
               message: i18n._({ id: 'form.field_required' }) || "此字段不能为空" 
             });
    }
  };
};

/**
 * 获取所有表单字段
 */
export const getAllFields = (
  regular: Record<string, RegularInfo> | undefined, 
  currentPay: PayMethod | undefined
): SchemaField[] => {
  if (!regular) return [];
  
  return Object.entries(regular)
    .filter(([, value]) => value.need === '0')
    .map(([key, value]) => ({
      label: value.label !== undefined ? value.label : value.name,
      format: formatNumberSpaced(value.template),
      ...value,
      key
    }))
    .sort((a, b) => a.position.localeCompare(b.position));
};

export type ValueType = {
  formValue: FormValue;
  regular?: Record<string, RegularInfo>;
};

export type ValidateResult = { [k in keyof FormValue]?: string };

/**
 * 验证必填字段 (Zod 实现)
 */
const validateNeedField = (
  needFieldList: string[], 
  { formValue, regular }: ValueType, 
  currentPay: PayMethod | undefined
): ValidateResult => {
  const errors: ValidateResult = {};
  const { getFieldValidator } = createFormSchema();
  
  // 单字段验证
  needFieldList.forEach(fieldKey => {
    try {
      // 获取字段值
      const value = formValue[fieldKey];
      
      // 使用适当的验证器验证字段
      getFieldValidator(fieldKey).parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 提取第一个错误信息
        const firstError = error.errors[0];
        errors[fieldKey] = firstError.message;
      }
    }
  });
  
  return errors;
};

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
const throttledValidateCard = throttle(async (
  token: string, 
  cardNo: string, 
  headers: Record<string, string | undefined>
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
}, 2000);

/**
 * 表单验证Hook
 */
export const useValidateResult = (
  regular: Record<string, RegularInfo> | undefined, 
  currentPay: PayMethod | undefined, 
  token?: string, 
  headers?: Record<string, string | undefined>
) => {
  const [validateResult, setValidateResult] = useState<ValidateResult>({});

  /**
   * 验证单个字段
   */
  const validateField = React.useCallback((
    key: string,
    formValue: FormValue
  ) => {
    setValidateResult((prevState) => {
      const currValidResult = validateNeedField([key], { formValue, regular }, currentPay);
      const updatedState = { ...prevState };
      
      if (currValidResult[key as keyof FormValue]) {
        updatedState[key as keyof FormValue] = currValidResult[key as keyof FormValue];
      } else {
        delete updatedState[key as keyof FormValue];
      }
      
      return updatedState;
    });
  }, [regular, currentPay]);

  /**
   * 验证多个字段
   */
  const validateFieldList = React.useCallback((
    needFieldList: string[],
    formValue: FormValue
  ) => {
    const result = validateNeedField(needFieldList, { formValue, regular }, currentPay);
    
    // 银行卡号远程验证
    const bankKey = needFieldList.find(key => key.includes('bankAccountNumber'));
    if (bankKey && formValue[bankKey]) {
      const bankAccountNumber = formValue[bankKey]?.toString().replace(/\s+/g, '');
      
      // 使用 Zod schema 验证银行账号格式
      try {
        // 获取银行账号验证器
        const bankAccountSchema = createFormSchema().getFieldValidator('bankAccountNumber');
        // 验证银行账号
        const isBankAccountNumberValid = bankAccountSchema.safeParse(bankAccountNumber);
        
        // 验证通过，进行远程验证
        if (token && headers && isBankAccountNumberValid.success) {
          throttledValidateCard(token, bankAccountNumber, headers).then((res) => {
            if (!res.success && res.msg && res.code !== '10000') {
              setValidateResult(prevState => ({
                ...prevState,
                [bankKey]: res.msg
              }));
            }
          });
        }
      } catch (error) {
        // Zod 验证错误会在前面的 validateNeedField 函数中捕获和处理
        // 这里不需要额外处理
      }
    }
    
    setValidateResult(result);
    return result;
  }, [regular, currentPay, headers, token]);

  /**
   * 重置验证结果
   */
  const resetValidate = React.useCallback(() => {
    setValidateResult({});
  }, []);

  return { 
    validateResult, 
    validateField, 
    validateFieldList, 
    resetValidate 
  };
};

/**
 * 处理表单值
 */
export const resolveValue = (
  value: Record<string, string | undefined>, 
  currentPay: PayMethod | undefined
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const key in value) {
    // 特殊处理 trustly 支付方式的持卡人姓名
    const isTrustlyHolderName = typeof value[key] === 'string' && 
                               currentPay?.type === 'trustly' && 
                               key.includes('paymentMethod.holderName');
    
    result[key] = isTrustlyHolderName 
      ? value[key]?.replace(/\s/g, '') 
      : value[key];
  }
  
  return result;
};
