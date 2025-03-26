import { useLayoutEffect, useRef, useState } from 'react';

function useLoadingValue<T>(value: T, loading: boolean, debug?: boolean): T | undefined {
  const prevRef = useRef<T>(value);
  const loadingRef = useRef<boolean>(false);
  const [viewValue, setViewValue] = useState<T | undefined>(value);
  useLayoutEffect(() => {
    if (loading) {
      // 加载中
      setViewValue(prevRef.current);
    } else if (!loading && loadingRef.current) {
      // 结束了
      prevRef.current = value;
      setViewValue(value);
    } else {
      // 未加载
      setViewValue(prevRef.current);
      requestAnimationFrame(() => {
        if (!loadingRef.current) {
          setViewValue(value);
        }
      })
    }
    if (debug) {
      console.log('useLoadingValue', loading, value, prevRef.current);
    }
    loadingRef.current = loading;
  }, [value, loading, debug]);
  if (debug && prevRef.current !== viewValue) {
    // debugger;
  }
  return viewValue;
}

export default useLoadingValue;
