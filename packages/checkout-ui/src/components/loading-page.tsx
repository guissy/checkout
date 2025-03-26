import React, { type PropsWithChildren } from 'react';
import SpinnerAudio from './spinner-audio';
const Loading: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full">
      <article className="[--fp-checkout-display:grid] h-full fp-checkout-article">
        <section className="bg-white place-content-center h-screen flex-1 [display:--fp-checkout-display]" id="futurepayLoading">
          <div className="flex flex-col items-center justify-center mx-6 sm:mx-auto text-center">
            <SpinnerAudio />
            <h2 className="text-[22px] font-extrabold mt-12 text-primary">Processing payment...</h2>
            <p className="text-[22px] font-semibold text-[#737C8B] mt-8">Waiting for the operator's response</p>
            <a href="javascript:history.back()" className="px-6 py-4 mt-14 text-lg font-semibold text-white bg-primary rounded-full text-center w-full md:min-w-[444px]">Back To Store</a>
          </div>
        </section>
        {children}
      </article>
    </div>
  );
};

export default Loading;
