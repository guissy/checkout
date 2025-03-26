'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Arrow, camelToPascalWithSpaces, InputError, type InputProps, SelectItem, SelectSearch } from 'checkout-ui';
import { FlagProvider } from '../(flag)/Flag';
import clsx from 'clsx';
import { type ValidateResult } from './validateNeedField';
import { type FormValue } from '../checkout/fp-checkout-type';
import fetchCountryInfoList, { type CountryInfo } from '../../api/fetchCountryInfoList';
import useClickOutside from '../../utils/onClickOutside';


type Props = {
  validateResult: ValidateResult;
  formValue: FormValue;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  countryCode: string | undefined
} & InputProps
const CountryInput: React.FC<Props> = ({ validateResult, formValue, setFormValue, label, countryCode: _countryCode, ...props }) => {
  const [keyword, setKeyword] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = React.useState<string>(_countryCode ?? '');
  const [open, setOpen] = React.useState(false);
  const [dirty, setDirty] = useState(false);
  const lastPosRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) lastPosRef.current?.parentElement?.scrollIntoView({ behavior: 'smooth' });
  }, [open]);
  const [dataSource, setDataSource] = useState<CountryInfo[]>([]);
  useEffect(() => {
    (async () => {
      const countriesRes = await fetchCountryInfoList();
      const countries = Array.isArray(countriesRes?.data) ? countriesRes?.data : [] as CountryInfo[];
      setDataSource(countries);
    })()
  }, []);
  useEffect(() => {
    if (!!_countryCode && !dirty) {
      setCountryName(dataSource.find(it => it.iso2Code === _countryCode)?.countryNameEn as string);
      setCountryCode(_countryCode!)
      setFormValue({ [props.name as keyof FormValue]: _countryCode } as unknown as FormValue, props.name as keyof FormValue)
    }
  }, [dataSource, _countryCode, setFormValue]);
  const wrapperRef = useRef<HTMLDivElement>(null); // 引用整个组件
  useClickOutside(wrapperRef, () => {
    if (open) {
      setOpen(false);
    }
  });
  return (
    <div className="w-full">
      <label
        htmlFor={props.name}
        className={clsx(
          'text-base/[1] transition-all duration-200 px-1 pointer-events-none mb-2 block font-bold',
        )}
      >
        {typeof label === 'string' ? camelToPascalWithSpaces(label ?? '') : label}
      </label>
      <div className={clsx("flex w-full mb-2 relative", open && "z-40")} ref={wrapperRef}>
        <div className={"w-full bg-white"}>
          <div
            role="combobox"
            className="relative [--border:218,11%,82%] [--normal-c:hsl(var(--foreground)] [--place:theme(colors.place)] [--focus-c:theme(colors.primary)]"
            onClick={() => setOpen(b => !b)}
          >
            <div
              className={clsx(
                'w-full flex items-center justify-between space-x-1 px-3 py-2 rounded-md focus:outline-none transition-all duration-300',
                'border border-[theme(colors.border)] h-[42px]',
                'pointer-events-none select-none', open && "rounded-bl-none"
              )}
            >
              <span className={"truncate w-full"}>{countryName}</span>
              <span
                className={clsx("ml-1 inline-block transition-transform group-open:rotate-0", open && "rotate-180")}>
              <Arrow direction="down" className="text-zinc-400"/>
            </span>
            </div>
          </div>
          <div className={clsx(
            "flex-1 w-full max-h-[50vh] z-10 absolute bg-white [&_.mt-4]:mt-0!",
            "[&_input]:rounded-none [&_.pt-4]:pt-0!",
            open ? "-mt-0.5" : "hidden")
          }>
            <SelectSearch
              onKeywordChange={(value) => setKeyword(value)}
              keyword={keyword}
              listClassName={open
                ? "border border-t-0 border-[theme(colors.border)] rounded-md rounded-tl-none rounded-tr-none max-h-[calc(100vh-300px)]"
                : ""}
            >
              <FlagProvider>
                {
                  Array.isArray(dataSource) &&
                  dataSource
                    ?.filter((it) => {
                      const kw = keyword?.trim().toLowerCase();
                      if (!kw) return true;
                      if (it.iso2Code?.toLowerCase() === kw) return true;
                      return (it.countryNameEn).toLowerCase().startsWith(kw) || (it.countryNameCn).toLowerCase().startsWith(kw)
                    })
                    ?.map((it, i) => (
                    <SelectItem
                      key={i}
                      value={it.iso2Code}
                      selected={countryCode === it.iso2Code}
                      onClick={() => {
                        setDirty(true);
                        setCountryCode?.(it.iso2Code);
                        setCountryName?.(it.countryNameEn);
                        setFormValue({ ...formValue, [props.name as keyof FormValue]: it.iso2Code }, props.name as keyof FormValue)
                        setOpen(b => !b);
                      }}
                      className={"rounded-none sm:rounded-lg"}
                    >
                      <div className={"flex space-x-4 items-center text-md justify-between"}>
                        <span className={"flex-1 items-center"}>
                          {it.countryNameEn}
                        </span>
                        <span className={"text-base text-zinc-400 pr-2 hidden"}>
                          {it.iso2Code}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </FlagProvider>
            </SelectSearch>
          </div>
        </div>
      </div>
      <InputError>{validateResult?.[props.name as keyof typeof validateResult]}</InputError>
      <div ref={lastPosRef}></div>
    </div>
  );
};

export default CountryInput;
