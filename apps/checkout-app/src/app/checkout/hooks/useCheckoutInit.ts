import { useCallback, useEffect, useState } from 'react';
import type { PaymentOrderInfo } from '../fp-checkout-type';
import fetchOrderDetail from '../../../api/fetchOrderDetail';
import { decryptAES } from '../../../utils/cryptoAES';
import { getReferenceValue, setReferenceValue } from '../referenceUtil';
import { reportUser } from '../../../api/reportArms';
import { isDebug } from '../../../utils/isDev';
import { hideLoading } from '../hideLoading';
import { i18n } from '@lingui/core';
import type { CurrencyExchangeInfo } from '../../../api/fetchCurrencyExchange';
import { useRouter } from 'next/navigation';

interface UseCheckoutInitProps {
  selfRef: React.RefObject<HTMLDivElement|null>;
  indexEndTime: number;
  routerInitTime: number;
}

interface UseCheckoutInitReturn {
  token: string;
  paymentOrderInfo?: PaymentOrderInfo;
  netError: string;
  setNetError: (msg: string) => void;
  currencyExchangeMap: Map<string, CurrencyExchangeInfo>;
  setCurrencyExchangeMap: React.Dispatch<React.SetStateAction<Map<string, CurrencyExchangeInfo>>>;
}

export const useCheckoutInit = ({
  selfRef,
  indexEndTime,
  routerInitTime,
}: UseCheckoutInitProps): UseCheckoutInitReturn => {
  const [token, setToken] = useState<string>('');
  const [paymentOrderInfo, setPaymentOrderInfo] = useState<PaymentOrderInfo>();
  const [netError, setNetErrorWrap] = useState('');
  const [currencyExchangeMap, setCurrencyExchangeMap] = useState<Map<string, CurrencyExchangeInfo>>(
    new Map()
  );
  const router = useRouter();
  console.log('routerInitTime:', routerInitTime, indexEndTime);

  const setNetError = useCallback((msg: string) => {
    if (msg) console.trace("Sth Error:", msg);
    setNetErrorWrap(msg);
  }, []);

  // 初始化函数
  const init = useCallback(async () => {
    try {
      const searchParams = new URL(window.location.href).searchParams;
      // const searchParams = useSearchParams();
      let orderData = '';
      const token = searchParams.get('token');
      if (!token || token === 'null' || token === 'undefined') {
        router.push("/debug");
        // setNetError('token not found');
        return;
      }
      setToken(token!);

      // TODO: indexEndTime, routerInitTime
      const dataApi = await fetchOrderDetail({ token: token! });
      if (dataApi.success) {
        if (dataApi.data) {
          orderData = dataApi.data as unknown as string;
        } else {
          setNetError('order not found');
          throw new Error('order not found');
        }
      } else if (dataApi.msg) {
        setNetError(dataApi.msg);
        throw new Error(dataApi.msg);
      }

      const data = await decryptAES(orderData);
      const paymentOrderInfo = JSON.parse(data) as PaymentOrderInfo;
      setReferenceValue(paymentOrderInfo?.pspReference || paymentOrderInfo?.reference || '')
      reportUser(getReferenceValue(), {
        amount: paymentOrderInfo?.amount?.value,
        currency: paymentOrderInfo?.amount?.currency,
        merchantId: paymentOrderInfo?.merchantId,
        productId: paymentOrderInfo?.productId,
        origin: paymentOrderInfo?.origin,
        token: token,
      });

      paymentOrderInfo.amount.value = paymentOrderInfo.amount?.value / 100;
      if (isDebug())  console.log('parsed data:', paymentOrderInfo);
      setPaymentOrderInfo(paymentOrderInfo);

      const HasHttp = paymentOrderInfo?.origin?.startsWith("http")
      const origin = HasHttp ? paymentOrderInfo?.origin : 'https://' + paymentOrderInfo?.origin;
      window.sessionStorage.setItem('returnUrl', paymentOrderInfo?.returnUrl || origin);

      setCurrencyExchangeMap(new Map([[paymentOrderInfo?.amount?.currency, {
        exRate: 1,
        futurePayRate: 1,
        out: paymentOrderInfo?.amount?.currency,
      }]]));

      if (!paymentOrderInfo.countryCode) {
        const language = navigator.language || navigator.languages?.[0];
        paymentOrderInfo.countryCode = language?.slice(3) ?? 'US';
      }

      if (isDebug()) {
        // paymentOrderInfo.countryCode = "any";
      }


      hideLoading(selfRef);


    } catch (error) {
      console.error('init checkout error:', error);
      setNetError((error as Error)?.message || i18n.t('payment.network_error'))
    } finally {
      hideLoading(selfRef)
    }
  }, [selfRef, router, setNetError]);

  // 初始化
  useEffect(() => {
    void init();
  }, [init]);

  return {
    token,
    paymentOrderInfo,
    netError,
    setNetError,
    currencyExchangeMap,
    setCurrencyExchangeMap,
  };
};
