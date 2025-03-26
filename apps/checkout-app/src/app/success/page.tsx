'use client';

declare global {
  interface Window {
    indexStartTime?: number;
  }
}

import React from "react";
import formatToUTC from "../../utils/formatToUTC";
import { isDebug } from "../../utils/isDev";
import { CopyButton as SpinCopy, Money } from "checkout-ui";
import Label from "./Label";
import DescItem from "./DescItem";
import BgSvg from "./BgSvg";
import { cn as clsx } from "../../lib/utils";
import gotoTimeout, { clearSessionStorage } from "../../utils/gotoTimeout";
import { reportResource } from "../../api/reportArms";
import { type OrderPay } from "../checkout/fp-checkout-type";
import AlipayType, { AlipaySecret } from "../(method)/AlipayType";
import { decrypt3DES } from "../../utils/crypto3DES";

const defaultDetail = {} as OrderPay;

const PaymentSuccess: React.FC = () => {
  const [result, setResult] = React.useState<OrderPay>(defaultDetail);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(false);
    let data = "";
    try {
      const search = window.location.search;
      const query = new URLSearchParams(search);
      const _data = query.get("data") ?? "";
      data = decrypt3DES(_data, AlipaySecret);
    } catch (error) {
      console.error(error);
    }
    if (!data) {
      data = window.sessionStorage.getItem("btr") ?? "";
    }
    if (!data) {
      gotoTimeout();
    }
    try {
      const orderData = JSON.parse(data ?? "");
      if (typeof orderData === "object" && orderData !== null) {
        if (isDebug())  console.log("decrypted data:", orderData);
        setResult(orderData as OrderPay);
        clearSessionStorage();
      }
      const name = "success";
      const duration = Date.now() - (window.indexStartTime || 0);
      reportResource(name, {
        url: window.location.href,
        method: "GET",
        responseStatus: 200,
        requestTime: Date.now(),
        responseTime: Date.now(),
        duration: 0,
        requestHeader: "",
        requestBody: JSON.stringify({ duration }),
        responseMessage: JSON.stringify(orderData),
        remark: "success",
        success: 1,
      });
    } catch (error) {
      console.error(error);
    }
  }, []);
  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-white">
      <div className={"w-full bg-primary"}>
        <div className="flex flex-col items-center pt-16 pb-0 transform">
          <svg
            height="105"
            viewBox="0 0 239 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M206.848 28.1747L211.712 30.2175L206.848 32.2602C205.508 32.8225 204.313 33.6815 203.349 34.7732C202.386 35.8649 201.68 37.1613 201.284 38.5656L198.729 47.6298L196.174 38.5656C195.778 37.1612 195.072 35.8647 194.108 34.7728C193.145 33.6809 191.949 32.8217 190.61 32.2591L185.746 30.2186L190.61 28.1758C191.949 27.6131 193.145 26.7537 194.108 25.6616C195.072 24.5695 195.778 23.2728 196.174 21.8682L198.729 12.804L201.284 21.8682C201.68 23.2727 202.386 24.5693 203.349 25.6612C204.313 26.7531 205.508 27.6123 206.848 28.1747ZM223.556 41.2729L225.92 42.2657L223.556 43.2585C222.905 43.5317 222.324 43.9492 221.856 44.4798C221.387 45.0104 221.044 45.6404 220.852 46.3229L219.61 50.7281L218.368 46.3229C218.176 45.6403 217.833 45.0103 217.364 44.4796C216.896 43.9489 216.315 43.5314 215.664 43.2579L213.3 42.2663L215.664 41.2735C216.315 41 216.896 40.5823 217.364 40.0516C217.833 39.5208 218.176 38.8906 218.368 38.208L219.61 33.8027L220.852 38.208C221.044 38.8906 221.387 39.5207 221.855 40.0514C222.324 40.582 222.905 40.9996 223.556 41.2729ZM50.6433 164.156L47.8064 162.964C47.0254 162.636 46.328 162.135 45.7662 161.498C45.2044 160.862 44.7927 160.105 44.5617 159.286L43.0716 154L41.5815 159.286C41.3505 160.105 40.9388 160.862 40.377 161.499C39.8152 162.135 39.1178 162.637 38.3368 162.965L35.5 164.156L38.3368 165.346C39.1178 165.674 39.8151 166.175 40.3769 166.812C40.9387 167.449 41.3504 168.205 41.5815 169.024L43.0716 174.31L44.5617 169.024C44.7928 168.205 45.2045 167.449 45.7663 166.812C46.3281 166.176 47.0255 165.675 47.8064 165.347L50.6433 164.156Z"
              fill="white"
            />
            <circle cx="119.5" cy="98" r="76" fill="white" fillOpacity="0.1" />
            <circle cx="119.5" cy="98" r="54" fill="white" />
            <path
              d="M110.488 115.892C110.884 116.307 111.356 116.636 111.874 116.86C112.393 117.084 112.949 117.2 113.511 117.2C114.072 117.2 114.628 117.084 115.147 116.86C115.665 116.636 116.137 116.307 116.534 115.892L142.448 88.8232C142.845 88.4085 143.16 87.9162 143.375 87.3744C143.59 86.8326 143.7 86.252 143.7 85.6655C143.7 85.0791 143.59 84.4984 143.375 83.9566C143.16 83.4148 142.845 82.9226 142.448 82.5079C142.051 82.0932 141.58 81.7643 141.061 81.5399C140.542 81.3155 139.986 81.2 139.425 81.2C138.864 81.2 138.308 81.3155 137.789 81.5399C137.27 81.7643 136.799 82.0932 136.402 82.5079L113.326 106.226L102.998 95.4385C102.197 94.6011 101.109 94.1306 99.9754 94.1306C98.8415 94.1306 97.7541 94.6011 96.9524 95.4385C96.1506 96.276 95.7002 97.4118 95.7002 98.5962C95.7002 99.1826 95.8108 99.7633 96.0256 100.305C96.2405 100.847 96.5554 101.339 96.9524 101.754L110.488 115.892Z"
              fill="#00112C"
            />
          </svg>
        </div>
        <div className="mx-auto text-center mb-[90px]">
          <h1 className="text-2xl font-semibold mt-4">Payment Successful</h1>
          <p className="text-center mt-2 mx-6 text-white/70">
            Your payment has been successful. Thank you for your purchase
          </p>
        </div>
      </div>
      <div
        className={
          "-mt-[60px] w-[calc(100vw-20px)] sm:w-[calc(100vw-40px)] max-w-[592px] rounded-xl h-[24px] bg-[#2D4161]"
        }
      />
      <div
        className={
          "relative w-[calc(100vw-20px)] sm:w-[calc(100vw-40px)] max-w-[592px] h-[384px]"
        }
      >
        <BgSvg />
        <div className="flex flex-col items-center text-primary p-5 pt-0 w-full">
          <div className="z-10 px-6 sm:px-8 w-full text-sm flex flex-col min-h-[320px]">
            <DescItem className={"py-[34px]!"}>
              <Label>Reference:</Label>
              <SpinCopy spinning={loading}>
                {result.pspReference ?? result.reference}
              </SpinCopy>
            </DescItem>
            <DescItem className={"mt-8"}>
              <Label>Payment amount:</Label>
              <SpinCopy spinning={loading}>
                <Money
                  value={result.order?.amount?.value}
                  currency={result.order?.amount?.currency}
                  valueFirst={false}
                />
                <span
                  className={clsx(
                    "text-gray-500 pl-1",
                    result.order?.amount?.currency === result.amount?.currency
                      ? "hidden"
                      : ""
                  )}
                >
                  <span>(</span>
                  <Money
                    value={result?.amount?.value}
                    currency={result?.amount?.currency}
                    valueFirst={false}
                  />
                  <span>)</span>
                </span>
              </SpinCopy>
            </DescItem>
            {AlipayType.includes(result?.currentPay?.type) && (
              <DescItem>
                <Label>Payment method:</Label>
                <span>{result?.currentPay?.platformName} (Alipay+)</span>
              </DescItem>
            )}
            <DescItem>
              <Label>Payment completion:</Label>
              <SpinCopy spinning={loading}>
                {formatToUTC(result.order?.expiresAt ?? Date.now())}
              </SpinCopy>
            </DescItem>
          </div>
        </div>
        <div className="mt-[72px] pb-16">
          <button
            className="bg-primary text-white py-3 px-6 rounded-full w-full max-w-[444px] mx-auto block hover:bg-primary/70 transition-colors"
            onClick={() => {
              window.location.href =
                window.sessionStorage.getItem("returnUrl") ||
                "javascript:history.back()";
            }}
          >
            Back to store
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
