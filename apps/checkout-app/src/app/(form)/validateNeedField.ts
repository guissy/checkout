import type { FormValue, PayMethod, RegularInfo, SchemaField } from '../checkout/fp-checkout-type';
import { i18n } from '@lingui/core';
import React, { useState } from 'react';
import { isDebug } from '../../utils/isDev';
import { formatNumberSpaced } from '../../utils/formatByTemplate';
import fetchValidCard from '../../api/fetchValidCard';
import throttle from 'lodash/throttle';

const validateField = (needFields: string[], schemaFields: SchemaField[], values: Record<string, string>) => {
  let expiryYear = '';
  let expiryMonth = ''
  return schemaFields
    .filter((field) => needFields.includes(field.key!))
    .map((schema) => {
      const field = schema.key!;
      const keyStr = schema.key.toLowerCase();
      // required
      if ((!values[field] || values[field] === '')) {
        return { field, message: i18n._({ id: 'form.field_required' }) }
      }
      // card number
      // 纯数字，最短14位，最长19位，不允许输入其他类型字符
      if (!schema.regular && keyStr.includes('bankAccountNumber'.toLowerCase())) {
        if (!/^\d{14,19}$/.test(values[field])) {
          return {
            field,
            message: i18n._({
              id: 'form.card_number_invalid',
              message: `Card number is invalid!`,
            })
          }
        }
      }
      // year month
      if (keyStr.includes('expiryYear'.toLowerCase())) {
        // 最大可输入当前年份, YY 格式，加10年，例如当前为2024年，则最大输入年份为2034年，不允许输入其他类型字符。
        const currentYear = new Date().getFullYear();
        const maxYear = (currentYear + 10) - 2000;
        if (!/^\d{2}$/.test(values[field]) || parseInt(values[field]) > maxYear) {
          return {
            field,
            message: i18n._({
              id: 'form.year_invalid',
              message: `Year is invalid!`,
            })
          }
        }
        expiryYear = values[field];
      }
      if (keyStr.includes('expiryMonth'.toLowerCase())) {
        // 01-12月，不允许输入其他类型字符。
        if (!/^(0[1-9]|1[0-2])$/.test(values[field])) {
          return {
            field,
            message: i18n._({
              id: 'form.month_invalid',
              message: `Month is invalid!`,
            })
          }
        }
        expiryMonth = values[field];
      }
      if (keyStr.includes('email'.toLowerCase())) {
        if (!/^\S+@\S+\.\S+$/.test(values[field])) {
          return {
            field,
            message: i18n._({
              id: 'form.email_invalid',
              message: `Email is invalid!`,
            })
          }
        }
      }
      if (expiryYear && expiryMonth) {
        // 您的银行卡已过期
        const expiryDate = new Date(2000 + Number(expiryYear), Number(expiryMonth) - 1, 31);
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          return {
            field,
            message: i18n._({
              id: 'form.card_expired',
              message: `Your bank card has expired!`,
            })
          }
        }
      }

      // cvv
      if ((keyStr.includes('cvv') || keyStr.includes('cvc'))) {
        // 最少3位，最多4位纯数字，不允许输入其他类型字符。
        if (!/^\d{3,4}$/.test(values[field])) {
          return {
            field,
            message: i18n._({
              id: 'form.cvv_invalid',
              message: `CVV is invalid!`,
              values: { x: schema.label?.toUpperCase() }
            })
          }
        }
      }
      // pattern
      if (schema.regular && !String(values[field]).match(new RegExp(schema.regular!))) {
        if (isDebug())  console.warn(new RegExp(schema.regular!), values[field], schema.label)
        return {
          field,
          message: i18n._({ id: 'form.field_invalid', message: `{x} is invalid!`, values: { x: schema.label } })
        }
      }
      return null;
    })
    .filter((error) => error !== null)
    .reduce((acc, error) => {
      acc[error!.field] = error!.message;
      return acc;
    }, {} as { [k in string]: string });
}

export const getAllFields = (regular: Record<string, RegularInfo> | undefined, currentPay: PayMethod | undefined): SchemaField[] => {
  // format: (value: string) => value.replace(/(\d{4})(?=\d)/g, '$1 ')
  if (currentPay?.type === 'trustly') {
    console.log('trustly')
  }
  return Object.entries(regular ?? {})
    .filter(([, value]) => value.need === '0')
    .map(([key, value]) => {
      const format = formatNumberSpaced(value.template)
      return {
        label: value.label !== undefined ? value.label : value.name,
        format,
        ...value,
        key
      }
    })
    .sort((a, b) => a.position.localeCompare(b.position))
}

export type ValueType = {
  formValue: FormValue;
  regular?: Record<string, RegularInfo>;
}

export type ValidateResult = { [k in keyof FormValue]?: string }
const validateNeedField = (needFieldList: string[], { formValue, regular }: ValueType, currentPay: PayMethod | undefined): ValidateResult => {
  const formValueErr = validateField(needFieldList, getAllFields(regular, currentPay), formValue as unknown as Record<string, string>);
  let err = {};

  if (Object.keys(formValueErr).length > 0) {
    err = { ...err, ...formValueErr };
  }
  return err;
}

const fetchValidCardCache: Record<string, { success: boolean, msg: string, code: string }> = {};

const throttledFetchValidCard = throttle(async (token: string, cardNo: string, headers: Record<string, string | undefined>) => {
  const cacheKey = `${token}_${cardNo}`;

  // 检查缓存是否存在
  if (fetchValidCardCache[cacheKey]) {
    return fetchValidCardCache[cacheKey];
  }

  // 发起请求
  const result = await fetchValidCard({ token, cardNo }, headers);

  // 将结果存入缓存
  fetchValidCardCache[cacheKey] = result;

  return result;
}, 2000);

export const useValidateResult = (regular: Record<string, RegularInfo> | undefined, currentPay: PayMethod | undefined, token?: string, headers?: Record<string, string | undefined>) => {
  const [validateResult, setValidateResult] = useState<ValidateResult>({});

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

  const validateFieldList = React.useCallback((
    needFieldList: string[],
    formValue: FormValue
  ) => {
    const result = validateNeedField(needFieldList, { formValue, regular }, currentPay)
    const bankKey = needFieldList.find(it => it.includes('bankAccountNumber'))
    if (bankKey && formValue[bankKey]) {
      const bankAccountNumber = formValue[bankKey]?.replace(/\s+/g, '')
      if (bankAccountNumber && bankAccountNumber?.length >= 10 && bankAccountNumber?.length <= 21 && token && headers) {
        throttledFetchValidCard(token, bankAccountNumber, headers).then((res) => {
          if (!res.success && res.msg && res.code !== '10000') {
            setValidateResult({
              [bankKey]: res.msg
            })
          }
        })
      }
    }
    setValidateResult(result);
    return result;
  }, [regular, currentPay, headers, token]);

  const resetValidate = React.useCallback(() => {
    setValidateResult({});
  }, []);

  return { validateResult, validateField, validateFieldList, resetValidate };
}

export const resolveValue = (value: Record<string, string | undefined>, currentPay: PayMethod | undefined) => {
  const result: Record<string, unknown> = {}
  for (const key in value) {
    if (typeof value[key] === 'string' && currentPay?.type === 'trustly' && key.includes('paymentMethod.holderName')) {
      result[key] = value[key]?.replace(/\s/g, '')
    } else {
      result[key] = value[key]
    }
  }
  return result
}
