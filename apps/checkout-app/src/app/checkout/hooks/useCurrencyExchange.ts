import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaymentOrderInfo, PayMethod } from '../fp-checkout-type';
import fetchCurrencyExchange, { type CurrencyExchangeInfo } from '../../../api/fetchCurrencyExchange';
import { truncateCurrency } from 'checkout-ui';

interface UseCurrencyExchangeProps {
  token: string;
  currentPay?: PayMethod;
  paymentOrderInfo?: PaymentOrderInfo;
  currency: string;
}

interface UseCurrencyExchangeReturn {
  currencyExchangeMap: Map<string, CurrencyExchangeInfo>;
  setCurrencyExchangeMap: React.Dispatch<React.SetStateAction<Map<string, CurrencyExchangeInfo>>>;
  currencyLoading: boolean;
  outAmount: string;
  setOutAmount: (value: string) => void;
  reloadExchange: () => Promise<void>;
}

export const useCurrencyExchange = ({
                                      token,
                                      currentPay,
                                      paymentOrderInfo,
                                      currency,
                                    }: UseCurrencyExchangeProps): UseCurrencyExchangeReturn => {
  const [currencyExchangeMap, setCurrencyExchangeMap] = useState<Map<string, CurrencyExchangeInfo>>(
    new Map()
  );
  const [currencyLoading, setCurrencyLoading] = useState<boolean>(false);
  const [outAmount, setOutAmount] = useState<string>('-');
  const prevCurrencyRef = useRef<string | undefined>(undefined);
  const isMountedRef = useRef(true);

  // 重新加载汇率信息
  const reloadExchange = useCallback(async () => {
    if (!currentPay?.type || !paymentOrderInfo?.amount?.currency || !currency) {
      return;
    }

    // 如果货币没有变化且已经有汇率数据，则不需要重新加载
    if (currency === prevCurrencyRef.current && currencyExchangeMap.has(currency)) {
      return;
    }

    setCurrencyLoading(true);
    try {
      const res = await fetchCurrencyExchange({
        token,
        markup: currentPay?.markup || 0,
        inCurrency: paymentOrderInfo.amount.currency,
        outCurrency: currency,
        paymentMethod: currentPay.type,
        fetch: '',
      }, {});

      if (res?.data?.exRate) {
        setCurrencyExchangeMap((map) => {
          const mapNew = new Map(map);
          mapNew.set(res.data.out, res.data);
          return mapNew;
        });
        prevCurrencyRef.current = currency; // 更新上一次货币引用
      }
    } catch (e) {
      console.error('fetch currency exchange error:', e);
    } finally {
      if (isMountedRef.current) {
        setCurrencyLoading(false);
      }
    }
  }, [currentPay, paymentOrderInfo?.amount?.currency, currency, token, currencyExchangeMap]);

  // 初始化加载和货币变化时重新加载
  useEffect(() => {
    const isDiffCurrency = paymentOrderInfo?.amount?.currency &&
      currency &&
      paymentOrderInfo.amount.currency !== currency;

    if (isDiffCurrency) {
      reloadExchange();
    } else if (paymentOrderInfo?.amount?.value) {
      // 货币相同，直接设置金额
      setOutAmount(paymentOrderInfo.amount.value.toString());
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [reloadExchange, paymentOrderInfo?.amount?.currency, paymentOrderInfo?.amount?.value, currency]);

  // 计算输出金额
  useEffect(() => {
    if (!currency || !paymentOrderInfo?.amount?.value) {
      setOutAmount('-');
      return;
    }

    // 货币相同，直接显示原值
    if (currency === paymentOrderInfo.amount.currency) {
      setOutAmount(paymentOrderInfo.amount.value.toString());
      return;
    }

    // 货币不同，计算转换后的金额
    const exchangeInfo = currencyExchangeMap.get(currency);
    if (!exchangeInfo?.futurePayRate) {
      setOutAmount('-');
      return;
    }

    const outAmountValue = parseFloat(exchangeInfo.futurePayRate.toString()) *
      parseFloat(paymentOrderInfo.amount.value.toString());

    setOutAmount(
      isNaN(outAmountValue)
        ? '-'
        : truncateCurrency(outAmountValue, currency).toString()
    );
  }, [currencyExchangeMap, paymentOrderInfo?.amount?.value, paymentOrderInfo?.amount?.currency, currency]);

  return {
    currencyExchangeMap,
    setCurrencyExchangeMap,
    currencyLoading,
    outAmount,
    setOutAmount,
    reloadExchange
  };
};
