import { useCallback, useRef, useState } from 'react';
import type { FormValue, PaymentOrderInfo, PayMethod, PayOrder } from '../fp-checkout-type';
import { EasyLink, NMI } from '../fp-checkout-type';
import type { PaymentOrderRes } from '../../../api/fetchPaymentOrder';
import fetchPaymentOrder from '../../../api/fetchPaymentOrder';
import { resolveValue, ValidateResult } from '../../(form)/validateNeedField';
import type { CountryInfo } from '../../../api/fetchCountryInfoList';
import { isDebug } from '../../../utils/isDev';
import { i18n } from '@lingui/core';
import { reportError, reportEvent } from '../../../api/reportArms';
import { getReferenceValue } from '../referenceUtil';
import AlipayType from '../../(method)/AlipayType';
import removeUndefinedProperties from '../../../utils/removeUndefinedProperties';
import merge from 'lodash/merge';
import set from 'lodash/set';
import { setFormElementsDisabled } from '../../../utils/formMouse';
import { getStorage, removeStorage, setStorage } from '@/lib/storage';
import useSessionState from '@/utils/useSessionState';

interface UseFormSubmitProps {
  token: string;
  currentPay?: PayMethod;
  paymentOrderInfo?: PaymentOrderInfo;
  country?: CountryInfo;
  currency: string;
  formValue: FormValue;
  outAmount: string;
  validateFieldList: (keys: string[], formValue: FormValue) => ValidateResult;
  navigate: (url: string) => void;
  setNetError: (msg: string) => void;
  goToSuccess: (data: PaymentOrderRes) => void;
}

interface UseFormSubmitReturn {
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  redirecting: boolean;
  setRedirecting: React.Dispatch<React.SetStateAction<boolean>>;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const useFormSubmit = ({
                                token,
                                currentPay,
                                paymentOrderInfo,
                                country,
                                currency,
                                formValue,
                                outAmount,
                                validateFieldList,
                                navigate,
                                setNetError,
                                goToSuccess
                              }: UseFormSubmitProps): UseFormSubmitReturn => {
  const [, setPayOrder] = useSessionState<PayOrder>("btr", {} as PayOrder);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const isSubmittingRef = useRef(false); // 使用 ref 来跟踪提交状态

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 防止重复提交
    if (isSubmittingRef.current) {
      console.error("Already submitting!");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setSubmitting(true);

      const btn = document.querySelector("#pay-btn")?.textContent;
      void reportEvent('form_submit', {
        btn: btn?.replace(/\n/g, '')?.trim(),
        value: outAmount
      });

      if (isDebug()) console.log('form submitting...');

      // 验证字段
      const validateResult = validateFieldList(currentPay?.needFieldName ?? [], formValue);
      if (Object.keys(validateResult).length > 0) {
        console.error('Validation errors:', validateResult);
        return;
      }

      if (!paymentOrderInfo?.amount?.value) {
        console.error("Amount is empty");
        return;
      }

      setNetError('');
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
        lineItems: undefined as unknown as [{ name: string; description: string }],
        countryCode: country?.iso2Code?.toString(),
        processingCurrency: currency,
        amount: {
          ...paymentOrderInfo?.amount,
          value: paymentOrderInfo?.amount?.value * 100,
        },
      };

      // 处理带点的字段名
      let dotKeyObj = {} as { paymentMethod?: { type?: string } };
      const _formValue = resolveValue(formValue, currentPay);

      if (currentPay?.needFieldName?.some(it => it.includes("."))) {
        dotKeyObj = currentPay.needFieldName.reduce((acc, cur) => {
          let value = _formValue[cur];
          if (cur.includes("telephoneNumber") && _formValue['callingCode']) {
            const callingCode = (_formValue['callingCode'] as string)?.replace(/^\+/, '');
            if (!['konbini', 'payeasy'].includes(currentPay?.type)) {
              value = callingCode + _formValue[cur];
            }
          }
          set(acc, cur, value);
          return acc;
        }, {});
      }

      // 特殊支付方式处理
      if (currentPay?.providerId === NMI) {
        if (currentPay?.type === 'cardsus') {
          pay.paymentMethod.holderName = `${formValue['paymentMethod.firstName']} ${formValue['paymentMethod.lastName']}`;
        } else if (currentPay?.type === 'googlepayus') {
          const googlePayToken = getStorage('gpt') ?? '';
          console.warn("Google Pay token:", googlePayToken);
          pay.paymentMethod.payToken = googlePayToken;
        }
      }

      if (paymentOrderInfo?.paymentMethod?.firstName && paymentOrderInfo?.paymentMethod?.lastName && !paymentOrderInfo?.paymentMethod?.holderName) {
        pay.paymentMethod.holderName = `${paymentOrderInfo.paymentMethod.firstName} ${paymentOrderInfo.paymentMethod.lastName}`;
      }

      if (currentPay?.providerId === EasyLink) {
        pay.lineItems = [{
          name: paymentOrderInfo?.productName,
          description: paymentOrderInfo?.productDetail,
        }];
      }

      // 特殊支付类型处理
      if (currentPay?.type === 'koreancard' || currentPay?.type === 'creditcardvm') {
        setStorage("payorder", JSON.stringify({
          paymentOrderInfo,
          dotKeyObj: {
            paymentMethod: {
              ...dotKeyObj?.paymentMethod,
              ...paymentOrderInfo?.paymentMethod,
            }
          },
        }));
        navigate(`/payorder?reference=${getReferenceValue()}&token=${token}`);
        return;
      }

      // 准备最终表单数据
      const formData = {
        ...removeUndefinedProperties(merge(
          {},
          paymentOrderInfo,
          pay,
          dotKeyObj,
          { returnUrl: paymentOrderInfo?.returnUrl }
        )),
      } as Record<string, unknown>;

      if (isDebug()) console.log('Form data:', formData);

      void reportEvent('token', {
        token: `${paymentOrderInfo?.merchantId} ${paymentOrderInfo?.productId} ${token}`
      });

      // 发送支付请求
      const res = await fetchPaymentOrder(formData, {
        'merchantId': paymentOrderInfo?.merchantId,
        'appID': paymentOrderInfo?.productId,
        'providerId': String(currentPay?.providerId),
      }, { token });

      if (isDebug()) console.log('Payment order response:', res);

      const status = res.data?.resultCode;
      if (status === 'SUCCEED' || status === 'SUCCESS' || status === 'PENDING') {
        if (isDebug()) console.log('Payment order created successfully');

        // 处理重定向
        if (res.data?.action?.type === 'redirect') {
          setRedirecting(true);

          setPayOrder({
            reference: paymentOrderInfo.reference,
            value: paymentOrderInfo.amount.value as number,
            currency: paymentOrderInfo.amount.currency,
            exValue: outAmount as number,
            exCurrency: currency as string,
            payType: currentPay?.type as string,
            payName: currentPay?.platformName as string,
            expiresAt: new Date().toUTCString(),
          })

          if (res.data?.action?.url || res.data?.action?.schemeUrl || res.data?.action?.applinkUrl) {
            removeStorage("o_d_o");

            if (AlipayType.includes(currentPay?.type as string)) {
              const search = res.data?.action?.payUrl?.split('?')?.[1];
              navigate(`/alipayPlus?${search}&token=${token}`);
            } else if (res.data?.action?.url?.includes("/payorder?reference=")) {
              const ref = res.data.action.url.split("/payorder?reference=")[1];
              navigate(`/payorder?reference=${ref}&token=${token}`);
            } else {
              window.location.href = res.data?.action?.url;
            }
          } else {
            goToSuccess(res.data);
          }
        }
        // 处理3DS认证
        else if (["pin", "avs", "sms"].includes(res.data?.action?.type as string)) {
          navigate(`/ThreeDSAuth?token=${token}&reference=${paymentOrderInfo?.reference}`);
        }
        // 处理二维码
        else if (res.data?.action?.type === 'qrcode') {
          window.history.pushState({}, '', window.location.href + '#qrcode');
        }
        // 处理USSD
        else if (status === 'PENDING' && res.data?.action?.type === 'ussd') {
          navigate(`/complete?reference=${getReferenceValue()}`);
        }
        // 其他成功情况
        else {
          goToSuccess(res.data);
        }
      } else {
        // 处理失败情况
        const errorResMsg = res.data?.refusalReason || res.data?.resultCode || res.msg || i18n.t("payment.failure");
        console.error('Payment failed:', errorResMsg);
        setNetError(errorResMsg);
        void reportError('payment_failure', res.code, errorResMsg, formData);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setNetError(i18n.t('payment.network_error'));
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
      setFormElementsDisabled(e.target as HTMLFormElement, false);
    }
  }, [
    token,
    currentPay,
    paymentOrderInfo,
    country?.iso2Code,
    currency,
    formValue,
    outAmount,
    validateFieldList,
    navigate,
    setNetError,
    goToSuccess
  ]);

  return {
    submitting,
    setSubmitting,
    redirecting,
    setRedirecting,
    handleFormSubmit,
  };
};
