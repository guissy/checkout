import { useCallback, useEffect, useState } from 'react';
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

  // 重新加载汇率信息
  const reloadExchange = useCallback(async () => {
    if (!!currentPay?.type && paymentOrderInfo?.amount?.currency && currency) {
      setCurrencyLoading(true);
      if (!currencyExchangeMap.has(currency) || !currentPay?.type) {
        return;
      }
      try {
        const res = await fetchCurrencyExchange({
          token,
          markup: currentPay?.markup || 0,
          inCurrency: paymentOrderInfo?.amount?.currency,
          outCurrency: currency,
          paymentMethod: currentPay?.type,
          fetch: '',
        }, {});
        if (res?.data?.exRate) {
          setCurrencyExchangeMap((map) => {
            const mapNew = new Map(map);
            mapNew.set(res?.data?.out, res?.data);
            return mapNew;
          });
        }
      } catch (e) {
        console.error('fetch currency exchange error:', e);
      } finally {
        setCurrencyLoading(false);
      }
    }
  }, [currentPay, currencyExchangeMap, paymentOrderInfo?.amount?.currency, currency, token]);

  // 货币转换
  const isDiffCurrency = paymentOrderInfo?.amount?.currency && currency && paymentOrderInfo?.amount?.currency !== currency;

  useEffect(() => {
    (async () => {
      try {
        if (isDiffCurrency) {
          await reloadExchange();
        }
      } catch (e) {
        console.error('👻 fetch currency exchange error', e);
      } finally {
        if (currency) {
          setCurrencyExchangeMap((map) => {
            return new Map(map);
          });
        }
      }
    })();
  }, [isDiffCurrency, reloadExchange, currency]);

  // 计算输出金额
  useEffect(() => {
    if (currency === '' || currency === undefined) {
      setOutAmount(paymentOrderInfo?.amount?.value?.toString() as string);
    } else {
      // 货币相同，直接显示原值
      if (currency === paymentOrderInfo?.amount?.currency) {
        setOutAmount(paymentOrderInfo?.amount?.value?.toString() as string);
      } else {
        const outAmount = parseFloat(currencyExchangeMap.get(currency)?.futurePayRate as unknown as string || '-') * parseFloat(paymentOrderInfo?.amount?.value?.toString() as string);
        setOutAmount(isNaN(outAmount) ? '-' : truncateCurrency(outAmount, currency ?? 'USD').toString());
      }
    }
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
