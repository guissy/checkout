import React from 'react';
import { truncateCurrency } from '../lib/truncateCurrency';

type Props = {
  currency?: string;
  value?: number;
  valueFirst: boolean;
  size?: 'lg' |'md' |'sm';
}

const Money: React.FC<Props> = ({ currency, value, valueFirst, size }) => {
  const amount = parseFloat(value?.toString() ?? "0") / 100;
  const formattedAmount = truncateCurrency(amount, currency ?? 'USD');

  return currency ? (
    valueFirst
      ? <>
        <span style={{ fontSize: size === 'lg'? '2.000rem' : size ==='md'? '1.5rem' : '' }}>{formattedAmount}</span>{' '}
        <span style={{ fontSize: size === 'lg'? '1.125rem' : size ==='md'? '1.0rem' : '', paddingLeft: '0.25rem' }}>{currency}</span>
      </>
      : <>
        <span style={{ fontSize: size === 'lg'? '1.125rem' : size ==='md'? '1.0rem' : '' }}>{currency}</span>
        <span style={{ fontSize: size === 'lg'? '2.000rem' : size ==='md'? '1.5rem' : '', paddingLeft: '0.25rem' }}>{formattedAmount}</span>{' '}
      </>
  ) : (<></>);
};


export default Money;
