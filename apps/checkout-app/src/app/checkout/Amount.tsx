import React from "react";
import {
  Divider,
  Money,
  SpinnerCycle as LoadingSpin,
  truncateCurrency,
} from "checkout-ui";
import clsx from "clsx";
import { Trans } from "@lingui/react";

type Props = {
  orderAmount?: number;
  inCurrency?: string;
  className?: string;
};

const Amount: React.FC<Props> = ({ orderAmount, inCurrency, className }) => {
  const showLoan = false;
  const currencyLoading = false;
  return (
    <div className={clsx("block flex-wrap select-none", className)}>
      {showLoan && (
        <>
          <h3
            className={
              "text-base sm:text-[20px] font-semibold text-[#1A1919] mb-4 sm:mb-6"
            }
          >
            <Trans id={"amount.loanDetails"} message="Loan details" />
          </h3>
          <div className={"flex items-center justify-between text-base/[1]"}>
            <dt className={"text-sm/[1]"}>
              <Trans
                id={"amount.selectedLoanAmount"}
                message="Selected loan amount"
              />
            </dt>
            <dd className={"font-semibold"}>
              <Money
                value={orderAmount}
                currency={inCurrency}
                valueFirst={true}
              />
            </dd>
          </div>
          <div
            className={
              "flex items-center justify-between text-base/[1] mt-3.5 mb-4"
            }
          >
            <dt className={"text-sm/[1]"}>
              <Trans id={"amount.loanFee"} message="Loan fee" />
            </dt>
            <dd className={"font-semibold"}>
              <Money
                value={orderAmount}
                currency={inCurrency}
                valueFirst={true}
              />
            </dd>
          </div>
          <Divider className={"mb-[18px] sm:mb-6 mx-4"} />
        </>
      )}
      <div
        className={
          "flex items-center justify-between text-base/[1] mb-[18px] sm:mb-0 total-amount"
        }
      >
        <dt className={"max-sm:text-sm/[1]"}>
          <Trans id={"amount.totalAmount"} message="Total amount" />
        </dt>
        <dd className="inline-flex items-end justify-center align-baseline text-base/[1]">
          {!currencyLoading && (
            <>
              <h1
                className={clsx("font-extrabold inline-block")}
                data-testid="total-amount"
              >
                <span className={"text-primary"} data-testid="pay-amount">
                  {orderAmount
                    ? truncateCurrency(orderAmount!, inCurrency!)
                    : ""}
                </span>
              </h1>
              <div
                className={clsx(
                  "font-bold inline-block ml-1 sm:pointer-events-none",
                )}
              >
                {inCurrency}
              </div>
            </>
          )}
          {currencyLoading && (
            <LoadingSpin className="text-[24px]/[28px] sm:text-[15px] inline-block ml-0.5" />
          )}
        </dd>
      </div>
    </div>
  );
};

export default Amount;
