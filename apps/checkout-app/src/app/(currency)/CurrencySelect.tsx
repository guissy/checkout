'use client';

import React, { useState } from 'react';
import { SelectItem, SelectSearch } from 'checkout-ui';
import { type CurrencyInfo } from './CurrencyInfo';
import { i18n } from '@lingui/core';
import { reportEvent } from '../../api/reportArms';

type FpCurrencyProps = {
  lang: string;
  value: string;
  setValue: (value: string) => void;
  currencyExchangeMap?: string;
  currencyInfo?: CurrencyInfo[];
};

const CurrencySelect: React.FC<FpCurrencyProps> = ({ lang, value, currencyInfo, setValue }) => {
  const [keyword, setKeyword] = useState<string>('');
  return (
    <div lang={lang} className="fp-currency">
      <SelectSearch
        keyword={keyword}
        onKeywordChange={(value) => setKeyword(value)}
        listClassName={"h-[calc(100vh-300px)]"}
      >
        {Array.isArray(currencyInfo) && currencyInfo
          .filter((it) => {
            if (!keyword.trim()) return true;
            return it.currencyCode?.toLowerCase().includes(keyword.trim().toLowerCase())
              || it.currencyCode?.toUpperCase() === keyword.trim().toUpperCase();
          })
          .map((it) => (
            <SelectItem
              key={it.currencyCode}
              value={it.currencyCode}
              selected={value === it.currencyCode}
              onClick={() => {
                setValue?.(it.currencyCode);
                void reportEvent('currency_change', { currencyCode: it.currencyCode });
              }}
            >
              <span>{it.currencyCode}</span>
              <span className={"block text-[#99A0AB] text-sm font-medium empty:hidden"}>{(i18n.locale === 'zh' ? it?.currencyName : it?.currencyNameEn)}</span>
            </SelectItem>
          ))}
        <div className={"sr-only only:not-sr-only text-[#99A0AB] text-center py-10"}>No Data</div>
      </SelectSearch>
    </div>
  );
};

export default CurrencySelect;
