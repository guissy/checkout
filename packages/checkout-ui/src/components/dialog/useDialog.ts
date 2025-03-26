import { useState, useEffect, useLayoutEffect } from 'react';

const useDialog = (open: boolean, duration = 500) => {
  const [shouldRender, setShouldRender] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setShouldRender(true);
    }
  }, [open]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!open) {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => clearTimeout(timeoutId);
  }, [open]);

  return shouldRender;
}

export default useDialog;
