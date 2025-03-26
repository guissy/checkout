import { useCallback, useEffect, useState, useRef } from 'react';
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
import { setStorage } from '@/lib/storage';

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
  const isInitialized = useRef(false); // 添加初始化标志位

  console.log('routerInitTime:', routerInitTime, indexEndTime);

  const setNetError = useCallback((msg: string) => {
    if (msg) console.trace("Sth Error:", msg);
    setNetErrorWrap(msg);
  }, []);

  // 初始化函数 - 现在使用 useCallback 并减少依赖项
  const init = useCallback(async () => {
    if (isInitialized.current) return; // 防止重复初始化
    isInitialized.current = true;

    try {
      const searchParams = new URL(window.location.href).searchParams;
      let orderData = '';
      const token = searchParams.get('token');

      if (!token || token === 'null' || token === 'undefined') {
        router.push("/debug");
        return;
      }

      setToken(token);

      const dataApi = await fetchOrderDetail({ token });
      if (!dataApi.success) {
        const errorMsg = dataApi.msg || 'order not found';
        setNetError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!dataApi.data) {
        setNetError('order data not found');
        throw new Error('order data not found');
      }

      orderData = dataApi.data as unknown as string;
      const data = await decryptAES(orderData);
      const paymentOrderInfo = JSON.parse(data) as PaymentOrderInfo;

      setReferenceValue(paymentOrderInfo?.pspReference || paymentOrderInfo?.reference || '');

      reportUser(getReferenceValue(), {
        amount: paymentOrderInfo?.amount?.value,
        currency: paymentOrderInfo?.amount?.currency,
        merchantId: paymentOrderInfo?.merchantId,
        productId: paymentOrderInfo?.productId,
        origin: paymentOrderInfo?.origin,
        token: token,
      });

      paymentOrderInfo.amount.value = paymentOrderInfo.amount?.value / 100;
      if (isDebug()) console.log('parsed data:', paymentOrderInfo);

      setPaymentOrderInfo(paymentOrderInfo);

      const hasHttp = paymentOrderInfo?.origin?.startsWith("http");
      const origin = hasHttp ? paymentOrderInfo?.origin : 'https://' + paymentOrderInfo?.origin;
      setStorage('returnUrl', paymentOrderInfo?.returnUrl || origin);

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

    } catch (error) {
      console.error('init checkout error:', error);
      setNetError((error as Error)?.message || i18n.t('payment.network_error'));
    } finally {
      hideLoading(selfRef);
    }
  }, [router, setNetError, selfRef]); // 减少依赖项

  // 初始化 - 只在组件挂载时执行一次
  useEffect(() => {
    void init();
    // 这里明确指定空依赖数组，确保只在组件挂载时执行一次
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    token,
    paymentOrderInfo,
    netError,
    setNetError,
    currencyExchangeMap,
    setCurrencyExchangeMap,
  };
};
