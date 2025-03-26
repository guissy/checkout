import { useState } from 'react';

interface UseToastAndDialogReturn {
  toastMsg: string;
  setToastMsg: (value: string) => void;
  showDetailMore: boolean;
  setShowDetailMore: (value: boolean) => void;
}

export const useToastAndDialog = (): UseToastAndDialogReturn => {
  const [toastMsg, setToastMsg] = useState('');
  const [showDetailMore, setShowDetailMore] = useState(false);

  return {
    toastMsg,
    setToastMsg,
    showDetailMore,
    setShowDetailMore
  };
};
