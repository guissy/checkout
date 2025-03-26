'use client';

import React from 'react';
import useLoadingValue from '../../utils/useLoadingValue';
import { type CurrencyExchangeInfo } from '../../api/fetchCurrencyExchange';
import { truncateCurrency } from 'checkout-ui';
import clsx from 'clsx';

type Props = {
  outAmount?: string;
  orderAmount?: number;
  inCurrency?: string;
  outCurrency?: string;
  currencyExchangeInfo?: CurrencyExchangeInfo;
  currencyLoading: boolean;
}

const AmountExchange: React.FC<Props> = ({ orderAmount, inCurrency, outCurrency, currencyLoading, currencyExchangeInfo }) => {
  const viewCurrency = useLoadingValue(outCurrency, currencyLoading);
  const futurePayRate = useLoadingValue(currencyExchangeInfo?.futurePayRate, currencyLoading);

  return (
      <div className={clsx('', inCurrency === outCurrency || viewCurrency === inCurrency ? 'opacity-0' : 'opacity-100')}>
        <p
          className={clsx('text-sm/[1] sm:text-sm font-bold mt-2 sm:mt-3 text-center')}>
          {truncateCurrency(orderAmount ?? 0, inCurrency ?? 'USD')} {inCurrency}{' '}
          <span className={clsx("text-sm/[1] sm:text-sm font-medium text-[#00112C]/50")}>
            (1 {inCurrency} = {futurePayRate} {viewCurrency})
          </span>
          <small className={'hidden sr-only'}>exchange rate from {inCurrency} to {outCurrency}</small>
        </p>
      </div>
  );
};

export default AmountExchange;
