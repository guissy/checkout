import { useEffect, useMemo } from 'react';
import type { CountryInfo } from '../../../api/fetchCountryInfoList';
import type { PayMethod } from '../fp-checkout-type';

export const useCurrencyInfo = (
  country: CountryInfo | undefined,
  currentPay: PayMethod | undefined,
  currency: string,
  setCurrency: (value: string) => void
) => {
  const currencyInfo = useMemo(() => {
    const countryCode = country?.iso2Code;
    const CountryToCurrencyCode = {
      "KE": "KES",
      "NG": "NGN",
      "TZ": "TZS",
      "ZA": "ZAR",
      "ZM": "ZMW"
    };

    if (currentPay?.type === "cardafrica") {
      const currency = countryCode ? CountryToCurrencyCode[countryCode as keyof typeof CountryToCurrencyCode] : '';
      const currencyOk = currentPay?.currencyInfo?.find(it => it.currencyCode === currency);
      if (currencyOk) {
        return [currencyOk];
      }
    }
    return currentPay?.currencyInfo;
  }, [country, currentPay]);

  useEffect(() => {
    if (currencyInfo?.[0]?.currencyCode) {
      const hasFound = currencyInfo?.find((it) => it.currencyCode === currency);
      if (!hasFound) {
        setCurrency(currencyInfo?.[0]?.currencyCode as string);
      }
    }
  }, [currentPay, currency, currencyInfo, setCurrency]);

  return {
    currencyInfo
  };
};
