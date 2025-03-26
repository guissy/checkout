import { useState } from 'react';

interface UseFormSubmitStateReturn {
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  redirecting: boolean;
  setRedirecting: (value: boolean) => void;
}

export const useFormSubmitState = (): UseFormSubmitStateReturn => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);

  return {
    submitting,
    setSubmitting,
    redirecting,
    setRedirecting
  };
};
