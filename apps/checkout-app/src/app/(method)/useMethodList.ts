import { type PayMethod } from '../checkout/fp-checkout-type';


export const filterCountry = (countryCode?: string) => (item: PayMethod) => {
  if (countryCode === 'any') return true;
  if (!countryCode || countryCode === 'global') return true;
  if (countryCode) return item.supportedConsumer?.split(',').includes(countryCode);
  return true
}
