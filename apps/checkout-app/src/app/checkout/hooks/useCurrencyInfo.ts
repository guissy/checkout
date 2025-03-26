import { useEffect, useMemo } from 'react';
import type { CountryInfo } from '../../../api/fetchCountryInfoList';
import type { PayMethod } from '../fp-checkout-type';

export const useCurrencyInfo = (
  country: CountryInfo | undefined,
  currentPay: PayMethod | undefined,
  currency: string,
  setCurrency: React.Dispatch<React.SetStateAction<string>>,
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
      const mappedCurrency = countryCode ? CountryToCurrencyCode[countryCode as keyof typeof CountryToCurrencyCode] : '';
      const currencyOk = currentPay?.currencyInfo?.find(it => it.currencyCode === mappedCurrency);
      return currencyOk ? [currencyOk] : [];
    }
    return currentPay?.currencyInfo || [];
  }, [country?.iso2Code, currentPay]); // Stable dependencies

  useEffect(() => {
    if (currencyInfo?.length > 0) {
      const firstCurrency = currencyInfo[0].currencyCode;
      const hasFound = currencyInfo.some(it => it.currencyCode === currency);

      // Only update if currency is different and not already in the list
      if (!hasFound && firstCurrency) {
        setCurrency(prevCurrency => prevCurrency !== firstCurrency ? firstCurrency : prevCurrency);
      }
    }
  }, [currencyInfo, setCurrency]); // Removed currentPay from deps as it's already in currencyInfo

  return {
    currencyInfo
  };
};
