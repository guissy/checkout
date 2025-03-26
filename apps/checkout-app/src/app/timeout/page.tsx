'use client';

import React from 'react';
import { i18n } from '@lingui/core';
import { clearSessionStorage } from '../../utils/gotoTimeout';
import ErrorUI from './ErrorUI.svg';
import Image from 'next/image';

const ErrorTimeout: React.FC = () => {
  i18n.activate('zh');
  React.useEffect(() => {
    clearSessionStorage();
  }, []);
  const title = i18n.t({ id: "timeout.heading", message: "Session Expired" });
  const detail = i18n.t({
    id: "timeout.message",
    message: "Your session has expired. Please get back to the store and retry your payment."
  });
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-20 text-center">
      <div className="flex flex-col items-center mb-6">
        <Image src={ErrorUI} alt="" />
      </div>
      <h1 className="text-2xl font-bold text-primary text-center mb-4">{title}</h1>
      <p className="text-base font-semibold leading-[20px] text-center px-6" style={{ color: '#808895' }}>
        {detail}
      </p>
      <a href={"javascript:history.back()"}
         className="px-6 py-1.5 mt-14 text-base/[32px] font-semibold text-white bg-primary rounded-full text-center md:min-w-[444px]">
        Back To Store
      </a>
    </main>
  );
};

export default ErrorTimeout;
