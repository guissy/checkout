import { useEffect, useRef, useState } from 'react';
import { i18n } from '@lingui/core';
import fetchOrderStatus, { OrderStatus } from '../api/fetchOrderStatus';
import { decryptAES } from './cryptoAES';
import { isDebug } from './isDev';
import gotoTimeout from './gotoTimeout';
import { useRouter } from 'next/navigation';
import { useOrderStatusStream } from '@/api/fetchOrderStatusStream';

// 支付状态轮询 Hook
export const useOrderStatusPolling = (reference: string | null, handleSuccess: (data: OrderStatus, reference: string) => void, ctx: string) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [startTime] = useState(Date.now());
  const loadingRef = useRef(false);
  const router = useRouter();
  const handleError = (msg: string, reference: string | null) => {
    console.error(ctx + ":::" + msg);
    router.push(`/error?msg=${msg}&reference=${reference}`);
  }

  const processOrderStatus = async () => {
    if (!reference || loadingRef.current) return;

    loadingRef.current = true;
    try {
      const res = await fetchOrderStatus(
        { reference },
        reloadKey === 0 ? 'Complete' : 'Loop'
      );

      if (typeof res.data === 'string') {
        const dataStr = await decryptAES(res.data);
        const data: OrderStatus = JSON.parse(dataStr);
        if (isDebug()) console.log('Parsed order status:', data);

        const status = data?.orderStatus;
        const origin = data?.origin?.startsWith("http")
          ? data.origin
          : `https://${data.origin}`;

        if (data?.downstreamRedirectUrl) {
          window.sessionStorage.setItem('returnUrl', data?.downstreamRedirectUrl);
        } else if (data?.origin) {
          window.sessionStorage.setItem('returnUrl', origin);
        }

        switch (status) {
          case 'SUCCEED':
          case 'SUCCESS':
            handleSuccess(data, reference);
            break;
          case 'PENDING':
            if (Date.now() - startTime < 10 * 60 * 1000) {
              setTimeout(() => setReloadKey(Date.now()), 5000);
            } else {
              gotoTimeout();
            }
            break;
          default:
            handleError(data?.errorMsg || res.msg, reference);
        }
      } else {
        handleError(res.msg, reference);
      }
    } catch (error) {
      console.error('Order status processing error:', error);
      handleError(i18n.t('error.unknown'), reference);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!reference) return;
    if (reloadKey >= 0) {
      processOrderStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, reloadKey]);


  const status = useOrderStatusStream(reference!);
  console.info(`sse: ${status}`)
};
