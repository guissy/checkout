'use client';

import CurrencyExchangeModalTop from "./CurrencyExchangeModalTop.svg";
import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';
import type { CurrencyExchangeInfo } from '../../api/fetchCurrencyExchange';
import { Trans } from '@lingui/react';
import { reportEvent } from '../../api/reportArms';
import Image from "next/image";

type Props = { markup?: number, currencyExchangeInfo?: CurrencyExchangeInfo, inCurrency?: string, outCurrency?: string, currencyLoading: boolean }
const CurrencyExchangeModal: FC<Props> = ({ markup, currencyExchangeInfo, inCurrency, outCurrency, currencyLoading }) => {
  void reportEvent("exchange_modal", { out_currency: outCurrency });
  const [offsetHeight, setOffsetHeight] = useState(0);
  // 监听窗口高度变化
  useEffect(() => {
    const handleResize = () => {
      setOffsetHeight(window.innerHeight < 640 ? 640 - window.innerHeight : 0)
    };

    handleResize(); // 初始化检查
    window.addEventListener('resize', handleResize); // 添加监听器

    return () => {
      window.removeEventListener('resize', handleResize); // 清理监听器
    };
  }, []);
  return (
      <div className="mx-auto text-center sm:w-[345px]">
        <div className="flex flex-col items-center justify-start">
          <Image
            className={'*:max-h-(--h)'}
            style={{ "--h": Math.max(160 - offsetHeight, 80) + "px" } as CSSProperties}
            src={CurrencyExchangeModalTop}
            alt="CurrencyExchangeModalTop"
          />
          <div className="text-[30px] font-bold mt-8 pb-6 leading-[1]">{ inCurrency } - {outCurrency}</div>
          <div className="pt-6 border-t border-[#EFF5FF] *:leading-[1]!">
            <div className="text-sm font-light"><Trans id={"fx.ecb.rate_label"} message="European Central Bank's rate:" /></div>
            <div className="text-xl font-bold mt-3">1 { inCurrency } = {currencyLoading ? '...' : currencyExchangeInfo?.exRate} {outCurrency}</div>
          </div>
          <div className="transform rotate-90 text-primary mt-8 -tracking-[1.5px]">
            ❯❯
          </div>
          <div className="mt-8 *:leading-[1]!">
            <div className="text-sm font-light"><Trans id={"fx.futurepay.rate_label"} message="FuturePay's rate" /></div>
            <div className="text-xl font-bold mt-3">1 { inCurrency } = {currencyLoading ? '...' : currencyExchangeInfo?.futurePayRate} {outCurrency}</div>
            <div className="text-xs font-medium my-3">
              <Trans id={"fx.margin_label"} message="Margin:" /> {markup! * 100} %</div>
          </div>
        </div>
    </div>
  );
};

export default CurrencyExchangeModal;
