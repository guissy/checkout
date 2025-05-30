import { useEffect } from 'react';
import fetchCheckStatus from '../api/fetchCheckStatus';
import { getReferenceValue } from '../app/checkout/referenceUtil';
import { getStorage, removeStorage } from '@/lib/storage';

let cacheOrder: string | null = null;
if (globalThis.window) {
  cacheOrder = getStorage("o_d_o");
}

const fetchThenReload = (token: string, ctx: "Visible" | "Reload" | "PageShow" | "Loop") => {
  fetchCheckStatus({ token }, ctx).then(async (res) => {
    if (!res.success) {
      removeStorage("o_d_o");
      removeStorage("route");
      window.history.pushState({}, '', `/complete?reference=` + getReferenceValue());
      window.dispatchEvent(new Event('popstate'));
    }
  })
}

let timeoutId: number | null = null;

const debouncedFetchThenReload = (token: string, ctx: "Visible" | "Reload" | "PageShow" | "Loop") => {
  if (!timeoutId) {
    fetchThenReload(token, ctx); // Call immediately
  }

  timeoutId = setTimeout(() => {
    timeoutId = null;
  }, 1500) as unknown as number; // Debounce for 1500ms
};


export const useCheckStatus = (token: string, needReload: boolean, cleanLoading: () => void) => {
  useEffect(() => {
    const handleVisibilityChange = function () {
      cleanLoading();
      if (document.visibilityState === 'visible') {
        if (needReload) debouncedFetchThenReload(token, 'Visible');
      }
    }
    const handlePageShow = (event: PageTransitionEvent) => {
      cleanLoading();
      if (event.persisted) {
        if (needReload) debouncedFetchThenReload(token, 'PageShow')
      }
    };
    if (token) {
      const tokenId = token?.replace(/-/g, "")
      if (token && cacheOrder?.includes(tokenId)) {
        debouncedFetchThenReload(token, 'Reload')
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    }
  }, [token, needReload, cleanLoading]);
}

