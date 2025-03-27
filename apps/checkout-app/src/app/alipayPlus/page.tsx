'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { QRCodeOptions, useQRCode } from 'react-qrcode'
import { Money, SpinnerCycle as LoadingSpin } from 'checkout-ui';
import isMobileScreen from '../../utils/isMobileScreen';
import { getIcon } from '../(method)/PayIconMap';
import { PaymentOrderRes } from '../../api/fetchPaymentOrder';
import useSessionState from '../../utils/useSessionState';
import { PayMethod, PayOrder } from '../checkout/fp-checkout-type';
import fetchPaymentInfo, { PaymentInfo } from '../../api/fetchPaymentInfo';
import { getReferenceValue, setReferenceValue } from '../checkout/referenceUtil';
import checkAlipayDeeplink from '../../utils/checkAlipayDeeplink';
import isPhone from '../../utils/isPhone';
import { useOrderStatusPolling } from '../../utils/useOrderStatusPolling';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';


const AliQrPage: React.FC = () => {

  const [payOrder] = useSessionState<PayOrder>("btr", undefined);
  const [currentPay, setCurrentPay] = useSessionState<PayMethod>("currentPay");
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [payInfo, setPayInfo] = useState<PaymentInfo>();
  useEffect(() => {
    (async () => {
      if (reference) {
        try {
          setLoading(true);
          const res = await fetchPaymentInfo({
            token: token!,
            reference: reference!,
          });
          setPayInfo(res?.data);
          if (res?.data?.merchantReference) {
            setReferenceValue(res?.data?.merchantReference as string);
          }
          setCurrentPay({
            type: res?.data?.action?.paymentMethodType,
            platformName: res?.data?.action?.paymentMethodType,
          } as PayMethod);
        } finally {
          setLoading(false);
        }
      }
    })()
  }, [token, reference, setCurrentPay]);
  const dataUrl = useQRCode({
    color: {
      dark: "#00112CFF",
      light: "#FFFFFFFF"
    },
    quality: 100,
    value: payInfo?.action?.qrCode ?? payInfo?.action?.schemeUrl ?? payInfo?.action?.applinkUrl ?? '',
    width: 320,
  } as QRCodeOptions)
  const isMobile = isMobileScreen();
  const { push: navigate } = useRouter()
  useOrderStatusPolling(reference!, () => {
    navigate(`/complete?reference=` + getReferenceValue());
  }, "AlipayPlus");
  const [svg] = getIcon(currentPay?.type as string, currentPay?.platformName as string) ?? [];
  const link = payInfo?.action?.schemeUrl ?? payInfo?.action?.applinkUrl;
  useEffect(() => {
    if (isPhone() && link) {
      checkAlipayDeeplink(link, () => {
      });
    }
  }, [link]);
  return (
    <div className={
      clsx(
        isMobile ? 'pt-[68px] min-h-full flex flex-col items-center justify-between' : "grid place-items-center min-h-full")
    }>
      <div className={clsx(
        'rounded-[12px] bg-white shadow-[0_0_16px_rgba(19,62,103,0.1)] w-[86vw] max-w-[360px]'
      )}>
        <div className={"text-center"}>
          <div className={"py-2.5 rounded-[12px] rounded-bl-none rounded-br-none flex items-center justify-center " +
            "shadow-[0_2px_6px_rgba(102,145,231,0.12)]"}>
            {svg
              ?
              <Image
                className={clsx(
                  "h-[42px] sm:h-[64px] flex items-center justify-center *:w-full *:h-full *:rounded-[8px]"
                )}
                src={svg}
                alt='icon'
              />
              : null}
            <div className={"pl-2.5 text-lg font-bold capitalize"}>
              {currentPay?.platformName}
            </div>
          </div>
          {loading || !dataUrl ?
            <div className={"h-[70vw] max-h-[320px] flex justify-center items-center"}>
              <LoadingSpin className={"size-[20px]"}/>
            </div>
            :
            <img src={dataUrl} className={'mx-auto w-[70vw] max-w-[320px] min-h-24 leading-[16rem] mt-2'}
                 alt="QR Code"/>}
          <p className={"text-2xl font-bold text-[#133E67] mb-8"}>
            <Money
              value={payOrder?.exValue ?? payOrder?.value}
              currency={payOrder?.exCurrency ?? payOrder?.exCurrency}
              valueFirst={true}
              size={'lg'}
            />
            {isPhone() && <button type={"submit"}
                     onClick={() => {
                       window.location.href = payInfo?.action?.schemeUrl ?? payInfo?.action?.applinkUrl ?? payInfo?.action?.url ?? ''
                     }}
                     id={"pay-btn2"}
                     className={clsx('flex space-x-3 items-center justify-center mx-auto mt-4 px-4 py-3 transition-colors',
                       'text-sm font-bold text-white bg-[#1A1919] hover:bg-primary/70',
                       "rounded-lg shadow-sm focus:outline-none focus:border-primary")}>
              Click to Start Alipay App
            </button>}
          </p>
        </div>
      </div>
      <div className={'text-center text-[14px] text-[#6F7988] mb-6'}>
        Accept all banks | Pay from any bank
      </div>
    </div>
  );
};

export default AliQrPage;
