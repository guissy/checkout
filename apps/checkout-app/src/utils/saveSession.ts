import type { OrderPay, PaymentOrderInfo } from '../app/checkout/fp-checkout-type';
import { isDebug } from './isDev';
import type { PaymentOrderRes } from '../api/fetchPaymentOrder.ts';
import { setStorage } from '@/lib/storage';

export function toJson(paymentOrderInfo: PaymentOrderInfo, outAmount: string, currency: string, data: OrderPay) {
  if (data && !data.amount && paymentOrderInfo?.amount && paymentOrderInfo?.amount?.value) {
    data.amount = {
      ...paymentOrderInfo.amount,
      value: paymentOrderInfo?.amount?.value * 100,
    }
  }
  if (data && !data.order) {
    data.order = {
      amount: {
        currency,
        value: Number(outAmount) * 100,
      }
    } as PaymentOrderRes['order']
  }
  return JSON.stringify(data);
}

export function saveSession(paymentOrderInfo: PaymentOrderInfo, outAmount: string, currency: string, data: OrderPay) {
  if (isDebug()) console.log("data = ", data)
  const type = data?.action?.type?.toLowerCase() ?? '_';
  const url = ['banktransfer', 'ussd'].includes(type) ? '/successBank' : '/success';
  const json = toJson(paymentOrderInfo, outAmount, currency, data);
  setStorage('btr', json);
  return url;
}
