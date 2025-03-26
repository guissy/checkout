import { useCallback, useRef, useState } from 'react';
import type { PaymentOrderInfo, PayMethod } from '../fp-checkout-type';
import { filterCountry } from '../../(method)/useMethodList';
import fetchPaymentList from '../../../api/fetchPaymentList';
import isPhone from '../../../utils/isPhone';
import { isDebug } from '../../../utils/isDev';

interface UsePaymentMethodReturn {
  currentPay?: PayMethod;
  setCurrentPay: (pay: PayMethod) => void;
  currentPayN: number;
  setCurrentPayN: (n: number) => void;
  paymentMethods: PayMethod[];
  paymentMethodsRaw: PayMethod[];
  hasPaymentMethod?: boolean;
  methodLoading: boolean;
  loadMethod: (paymentOrderInfo: PaymentOrderInfo, token: string, countryCode?: string) => Promise<void>;
  loadedMethodRef: React.MutableRefObject<boolean>;
}

export const usePaymentMethod = (): UsePaymentMethodReturn => {
  const [currentPay, setCurrentPay] = useState<PayMethod>();
  const [currentPayN, setCurrentPayN] = useState<number>(NaN);
  const [paymentMethods, setPaymentMethods] = useState<PayMethod[]>([]);
  const [paymentMethodsRaw, setPaymentMethodsRaw] = useState<PayMethod[]>([]);
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>();
  const [methodLoading, setMethodLoading] = useState(false);
  const loadedMethodRef = useRef<boolean>(false);

  const loadMethod = useCallback(async (paymentOrderInfo: PaymentOrderInfo, token: string, countryCode?: string) => {
    setMethodLoading(true);
    if (isDebug())  console.info('start fetchPaymentList');

    try {
      const res = await fetchPaymentList({ token, countryCode: '' }, {
        'merchantId': paymentOrderInfo?.merchantId ?? "__error__",
        'appID': paymentOrderInfo?.productId ?? "__error__",
      }, {
        holderName: paymentOrderInfo?.paymentMethod?.holderName ??
          [paymentOrderInfo?.paymentMethod?.firstName, paymentOrderInfo?.paymentMethod?.lastName]
            .filter(Boolean).join(' ').trim(),
        firstName: paymentOrderInfo?.paymentMethod?.firstName,
        lastName: paymentOrderInfo?.paymentMethod?.lastName,
        shopperEmail: paymentOrderInfo?.paymentMethod?.shopperEmail,
      });

      if (res.code !== "40027") {
        const methodsRaw = Array.isArray(res?.data) ? res?.data : [] as PayMethod[];
        if (isDebug())  console.info('loaded methods:', methodsRaw?.length);

        let methodsOk = methodsRaw.filter(filterCountry(countryCode));
        if (!isPhone()) {
          // PC only
          methodsOk = methodsOk.filter(it => it.type !== 'thaibanksapp');
        }

        if (isDebug())  console.info('load methods ok:', methodsOk?.length);

        if (methodsOk?.length === 0) {
          setHasPaymentMethod(false);
          console.error('loadMethod() error: method not found', methodsOk);
        } else {
          setHasPaymentMethod(true);
        }

        setCurrentPay((payMethodPrev) => {
          const exists = methodsOk?.some((method) =>
            payMethodPrev?.type === method.type
          );
          const _default = methodsOk?.find((method) =>
            paymentOrderInfo?.paymentMethod?.type === method.type);
          const _first = methodsOk
            .find(item => item.supportedConsumer?.split(',').includes(countryCode as string)) ?? methodsOk?.[0];
          return exists ? payMethodPrev : (_default || _first);
        });

        setPaymentMethods(methodsOk!);
        setPaymentMethodsRaw(prev => prev?.length > methodsRaw?.length ? prev : methodsRaw);
      }

      loadedMethodRef.current = true;
    } finally {
      setMethodLoading(false);
    }
  }, []);


  return {
    currentPay,
    setCurrentPay,
    currentPayN,
    setCurrentPayN,
    paymentMethods,
    paymentMethodsRaw,
    hasPaymentMethod,
    methodLoading,
    loadMethod,
    loadedMethodRef,
  };
};
