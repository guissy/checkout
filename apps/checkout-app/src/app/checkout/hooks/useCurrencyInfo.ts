import { useEffect, useMemo } from "react";
import type { CountryInfo } from "../../../api/fetchCountryInfoList";
import type { PayMethod } from "../fp-checkout-type";

/**
 * Custom hook to handle currency information based on country and payment method
 *
 * @param country - The selected country information
 * @param currentPay - The current payment method
 * @param currency - The current currency string
 * @param setCurrency - Function to set currency (accepts string directly, not setState)
 * @returns Object containing currency information
 */
export const useCurrencyInfo = (
  country: CountryInfo | undefined,
  currentPay: PayMethod | undefined,
  currency: string,
  setCurrency: (currency: string) => void,
) => {
  // Map available currencies based on payment method and country
  const currencyInfo = useMemo(() => {
    const countryCode = country?.iso2Code;
    const CountryToCurrencyCode = {
      KE: "KES",
      NG: "NGN",
      TZ: "TZS",
      ZA: "ZAR",
      ZM: "ZMW",
    };

    if (currentPay?.type === "cardafrica") {
      const mappedCurrency = countryCode
        ? CountryToCurrencyCode[
            countryCode as keyof typeof CountryToCurrencyCode
          ]
        : "";
      const currencyOk = currentPay?.currencyInfo?.find(
        (it) => it.currencyCode === mappedCurrency,
      );
      return currencyOk ? [currencyOk] : [];
    }
    return currentPay?.currencyInfo || [];
  }, [country?.iso2Code, currentPay]);

  // Set default currency or validate currency exists in available options
  useEffect(() => {
    if (currencyInfo?.length > 0) {
      const firstCurrency = currencyInfo[0].currencyCode;
      const hasFound = currencyInfo.some((it) => it.currencyCode === currency);

      // Only update if currency is not in the available list
      if (!hasFound && firstCurrency && firstCurrency !== currency) {
        setCurrency(firstCurrency);
      }
    }
    // We intentionally don't include currency in dependencies to prevent loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currencyInfo, setCurrency]);

  return {
    currencyInfo,
  };
};
