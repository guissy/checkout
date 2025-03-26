'use client';

import React, { useState } from 'react';
import { i18n } from '@lingui/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingPage as Loading, SpinnerCycle } from 'checkout-ui';
import { useOrderStatusPolling } from '../../utils/useOrderStatusPolling';

const Complete: React.FC = () => {
  i18n.activate("zh")
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const { push: navigate } = useRouter()
  const [loading, setLoading] = useState(true);

  useOrderStatusPolling(reference!, () => {
    setLoading(false);
    navigate(`/success?reference=` + reference);
  }, "Completed");

  return loading ? <Loading/> : (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className='grid place-items-center'>
        <SpinnerCycle />
      </div>
      <p className="mt-2 text-gray-600">{i18n.t({
        id: "result.transactionCompleted",
        message: "Your transaction was completed successfully."
      })}</p>
    </div>
  );
}

export default Complete;
