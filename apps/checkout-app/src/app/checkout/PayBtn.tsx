import React, { type PropsWithChildren } from 'react';
import { SpinnerCycle as LoadingSpin } from 'checkout-ui';
import { Trans } from '@lingui/react';
import clsx from 'clsx';
import useLoadingValue from '../../utils/useLoadingValue';
import './PayBtn.css';

type PayBtnProps = {
  submitting: boolean;
  currencyLoading: boolean;
  redirecting: boolean;
  outAmount: React.ReactNode | undefined;
  currency: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  googlePay?: boolean;
}
const PayBtn: React.FC<PropsWithChildren<PayBtnProps>> = ({
                                                            submitting,
                                                            outAmount,
                                                            currency,
                                                            redirecting,
                                                            currencyLoading,
                                                            onClick,
                                                            children,
                                                            googlePay,
                                                          }) => {
  const viewCurrency = useLoadingValue(currency, currencyLoading);
  const viewAmount = useLoadingValue(outAmount, currencyLoading);
  const submitRedirect = submitting || redirecting;
  return (
    <div className="mt-0 sm:mt-2 relative">
      <div className={googlePay ? "hidden" : "flex justify-center"}>
        <button type={typeof onClick === 'function' ? 'button' : 'submit'}
                disabled={currencyLoading || submitRedirect}
                onClick={onClick} id={"pay-btn"}
                className={clsx('flex items-center justify-center w-full px-4 py-3 transition-colors',
                  currencyLoading && 'disabled:bg-[#9A9A9A] disabled:cursor-not-allowed',
                  submitRedirect && 'disabled:opacity-80 disabled:cursor-not-allowed',
                  'text-sm font-bold text-white bg-[#1A1919] hover:bg-primary/70 h-[44px]',
                  "rounded-lg shadow-sm focus:outline-none focus:border-primary",
                  "transition-colors duration-200 ease-in-out relative"
                )}>
          <div className={clsx(currencyLoading || !outAmount ? '' : 'hidden')}>
            <LoadingSpin className={"size-[20px]"}/>
          </div>
          {/*{!currencyLoading && !submitRedirect &&*/}
          {/*  <div className={"*:w-[20px]"} dangerouslySetInnerHTML={{ __html: PayConfirmIcon }}/>}*/}
          {submitRedirect || !outAmount
            ? <LoadingSpin className={"size-[20px]"}/>
            : <span key={viewCurrency} className={currencyLoading ? 'hidden' : ''}>
                <Trans
                  id="payment.pay_btn"
                  message="Pay {outAmount} {currency}"
                  values={{
                    outAmount: outAmount === '-' ? viewAmount : outAmount,
                    currency: viewCurrency
                  }}></Trans>
          </span>}
        </button>
      </div>
      {children}
    </div>
  );
};

export default PayBtn;
