import { useCallback, useState } from 'react';
import type { FormValue, PaymentOrderInfo, PayMethod } from '../fp-checkout-type';
import { EasyLink, NMI } from '../fp-checkout-type';
import type { PaymentOrderRes } from '../../../api/fetchPaymentOrder';
import fetchPaymentOrder from '../../../api/fetchPaymentOrder';
import { resolveValue, ValidateResult } from '../../(form)/validateNeedField';
import type { CountryInfo } from '../../../api/fetchCountryInfoList';
import { isDebug } from '../../../utils/isDev';
import { i18n } from '@lingui/core';
import { reportError, reportEvent } from '../../../api/reportArms';
import { getReferenceValue } from '../referenceUtil';
import { saveSession } from '../../../utils/saveSession';
import AlipayType from '../../(method)/AlipayType';
import removeUndefinedProperties from '../../../utils/removeUndefinedProperties';
import merge from 'lodash/merge';
import set from 'lodash/set';
import { setFormElementsDisabled } from '../../../utils/formMouse';

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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    const btn = document.querySelector("#pay-btn")?.textContent;
    void reportEvent('form_submit', { btn: btn?.replace(/\n/g, '')?.trim(), value: outAmount });
    if (isDebug())  console.log('form...');
    e.preventDefault();
    e.stopPropagation();
    if (submitting) {
      console.error("submitting!!!");
      return;
    }
    const validateResult = validateFieldList(currentPay?.needFieldName ?? [], formValue);
    if (Object.values(validateResult).length) {
      console.error(validateResult);
      return;
    }
    if (!paymentOrderInfo?.amount?.value) {
      console.error("amount is empty");
      return;
    }
    setSubmitting(true);
    setNetError('');
    setFormElementsDisabled(e.target as HTMLFormElement, true);
    if (isDebug())  console.log('form errors:', validateResult);
    if (!Object.keys(validateResult).length) {
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
      }
      let dotKeyObj = {} as { paymentMethod?: { type?: string} };
      const _formValue = resolveValue(formValue, currentPay);
      if (currentPay?.needFieldName?.some(it => it.includes("."))) {
        dotKeyObj = currentPay?.needFieldName?.reduce((acc, cur) => {
          let value = _formValue[cur];
          if (cur.includes("telephoneNumber") && _formValue['callingCode']) {
            const callingCode = (_formValue['callingCode'] as string)?.replace(/^\+/, '');
            // 小日本不需要国际码
            if (!['konbini', 'payeasy'].includes(currentPay?.type)) {
              value = callingCode + _formValue[cur];
            }
          }
          set(acc, cur, value);
          return acc;
        }, {});
      }
      if (currentPay?.providerId === NMI && currentPay?.type === 'cardsus') {
        pay.paymentMethod.holderName = formValue['paymentMethod.firstName'] + " " + formValue['paymentMethod.lastName'];
      }
      if (paymentOrderInfo?.paymentMethod?.firstName && paymentOrderInfo?.paymentMethod?.lastName && !paymentOrderInfo?.paymentMethod?.holderName) {
        pay.paymentMethod.holderName = paymentOrderInfo?.paymentMethod?.firstName + " " + paymentOrderInfo?.paymentMethod?.lastName;
      }
      if (currentPay?.providerId === NMI && currentPay?.type === 'googlepayus') {
        const googlePayToken = window.sessionStorage.getItem('gpt') ?? '';
        console.warn("Google Pay: " + googlePayToken)
        pay.paymentMethod.payToken = googlePayToken;
      }
      if (currentPay?.providerId === EasyLink) {
        pay.lineItems = [{
          name: paymentOrderInfo?.productName,
          description: paymentOrderInfo?.productDetail,
        }]
      }
      const returnUrlObj = {
        returnUrl: paymentOrderInfo?.returnUrl
      }
      if (currentPay?.type === 'koreancard' || currentPay?.type === 'creditcardvm') {
        window.sessionStorage.setItem("payorder", JSON.stringify({
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
      const formData = {
        ...removeUndefinedProperties(merge({}, paymentOrderInfo, pay, dotKeyObj, returnUrlObj)),
      } as Record<string, unknown>;
      if (isDebug())  console.log('💯:', formData);
      void reportEvent('token', {
        token: paymentOrderInfo?.merchantId + " " + paymentOrderInfo?.productId + " " + token
      });
      fetchPaymentOrder(formData, {
        'merchantId': paymentOrderInfo?.merchantId,
        'appID': paymentOrderInfo?.productId,
        'providerId': String(currentPay?.providerId),
      }, { token }).then((res) => {
        if (isDebug())  console.log('form payment order:', res);
        const status = res.data?.resultCode;
        if ((status === 'SUCCEED' || status === 'SUCCESS' || status === 'PENDING')) {
          if (isDebug())  console.log('form payment order created successfully💯');
          if (res.data?.action?.type === 'redirect') {
            setRedirecting(true);
            if (AlipayType.includes(currentPay?.type as string) && currentPay) {
              const resPay = Object.assign({}, res.data, { currentPay: currentPay });
              saveSession(paymentOrderInfo, outAmount, currency, resPay);
            }
            if (res.data?.action?.url || res.data?.action?.schemeUrl || res.data?.action?.applinkUrl) {
              window.sessionStorage.removeItem("o_d_o");
              if (AlipayType.includes(currentPay?.type as string)) {
                const search = res.data?.action?.payUrl?.split('?')?.[1];
                navigate(`/alipayPlus?${search}&token=${token}`);
              } else if (res.data?.action?.url?.includes("/payorder?reference=")) {
                const ref = res.data?.action?.url.split("/payorder?reference=")[1];
                navigate(`/payorder?reference=${ref}&token=${token}`);
              } else {
                window.location.href = res.data?.action?.url;
              }
            } else {
              goToSuccess(res.data)
            }
          } else if (["pin", "avs", "sms"].includes(res.data?.action?.type as string)) {
            setSubmitting(false);
            navigate(`/ThreeDSAuth?token=${token}&reference=${paymentOrderInfo?.reference}`)
          } else if (["qrcode"].includes(res.data?.action?.type as string)) {
            setSubmitting(false);
            window.history.pushState({}, '', window.location.href + '#qrcode');
          } else if (status === 'PENDING' && ["ussd"].includes(res.data?.action?.type as string)) {
            navigate(`/complete?reference=` + getReferenceValue());
          } else {
            goToSuccess(res.data)
          }
        } else {
          const errorResMsg = res.data?.refusalReason || res.data?.resultCode || res.msg || i18n.t("payment.failure");
          console.error('form payment order failed:', errorResMsg);
          setNetError(errorResMsg);
          setSubmitting(false);
          setFormElementsDisabled(e.target as HTMLFormElement, false);
          void reportError('payment_failure', res.code, errorResMsg, formData);
        }
      }).catch((error) => {
        console.error('init checkout error:', error);
        setNetError(i18n.t('payment.network_error'));
        setSubmitting(false);
        setFormElementsDisabled(e.target as HTMLFormElement, false);
      }).finally(() => {
        setSubmitting(false);
      });
    }
  }, [country?.iso2Code, submitting, setSubmitting, setRedirecting, currentPay, paymentOrderInfo, currency, formValue, outAmount, validateFieldList, navigate, setNetError, goToSuccess, token]);
  return {
    submitting,
    setSubmitting,
    redirecting,
    setRedirecting,
    handleFormSubmit,
  };
};
