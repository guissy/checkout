'use client';

import React, { useState } from 'react';
import { type CountryInfo } from '../../api/fetchCountryInfoList';
import { SelectItem, SelectSearch } from 'checkout-ui';
import { reportEvent } from '../../api/reportArms';
import isDev from '@/utils/isDev';

type FpCountryProps = {
  lang?: string;
  value?: string;
  countries: CountryInfo[];
  setValue?: (value: CountryInfo) => void;
};

const CountrySelect: React.FC<FpCountryProps> = ({ lang, countries, value, setValue }) => {
  const [keyword, setKeyword] = useState<string>('');
  const filteredCountries = countries
    .filter((it) => {
      const kw = keyword?.trim().toLowerCase();
      if (!kw) return true;
      if (it.iso2Code?.toLowerCase() === kw) return true;
      if (it.iso2Code === value) return true;
      return (it.countryNameEn).toLowerCase().startsWith(kw) || (it.countryNameCn).toLowerCase().startsWith(kw)
    })
    .map((it) => ({
      ...it,
      selected: value?.toUpperCase() === it.iso2Code?.toUpperCase(),
    }));

  return (
    <div lang={lang}>
      <SelectSearch
        keyword={keyword}
        onKeywordChange={(value) => setKeyword(value)}
        listClassName={"h-[calc(100vh-300px)]"}
      >
        {filteredCountries.map((item) => (
          <SelectItem
            key={item.iso2Code}
            value={item.iso2Code}
            selected={item.selected}
            onClick={() => {
              void reportEvent('country_change', { countryCode: item.iso2Code });
              setValue?.(item as CountryInfo);
            }}
          >
            <span className={lang === 'zh' ? 'inline' : 'hidden'} data-value={value}>
              {item.countryNameCn || ''}
            </span>
            <span className={lang === 'zh' ? 'hidden' : 'inline'}>
              {item.countryNameEn || ''}
            </span>
            {isDev() ? (<small className="pl-2 text-md text-gray-400">({item.iso2Code})</small>) : null}
          </SelectItem>
        ))}
        <div className={"sr-only only:not-sr-only text-[#99A0AB] text-center py-10"}>No Data</div>
      </SelectSearch>
    </div>
  );
};

export default CountrySelect;
