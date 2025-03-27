'use client';

import React, { useMemo, useRef, useState } from 'react';
import Flag, { FlagProvider } from '../(flag)/Flag';
import clsx from 'clsx';
import { Arrow, camelToPascalWithSpaces, Input, InputError, InputProps, SelectItem, SelectSearch } from 'checkout-ui';
import { type ValidateResult } from './validateNeedField';
import { type FormValue } from '../checkout/fp-checkout-type';
import type { CountryInfo } from '../../api/fetchCountryInfoList';
import resolveCallingCode from './resolveCallingCode';
import useClickOutside from '../../utils/onClickOutside';


type Props = {
  countries: CountryInfo[];
  countryCode?: string;
  validateResult: ValidateResult;
  formValue: FormValue;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
} & InputProps;
const CallingCode: React.FC<Props> = ({ countryCode, validateResult, formValue, setFormValue, label, countries, ...props }) => {
  const [iso2Code, setIsoCode] = React.useState(countryCode);
  const [keyword, setKeyword] = useState('');
  const [callingCode, setCallingCode] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);
  const lastPosRef = React.useRef<HTMLDivElement>(null);
  const countryCallingCodes = useMemo(() => {
    return resolveCallingCode(countries);
  }, [countries]);
  React.useEffect(() => {
    if (open) lastPosRef.current?.parentElement?.scrollIntoView({ behavior: 'smooth' });
  }, [open]);
  React.useEffect(() => {
    const callingCodeObj = countryCallingCodes.find(
      it => it.iso2Code.toLowerCase() === countryCode?.toLowerCase()
    );
    const newCallingCode = callingCodeObj?.callingCode || '';

    // 检查是否需要更新
    if (countryCode &&
      newCallingCode &&
      (newCallingCode !== callingCode || countryCode !== iso2Code)
    ) {
      setFormValue({ callingCode: '+' + newCallingCode } as unknown as FormValue, 'callingCode');
      setCallingCode(newCallingCode);
      if (countryCode !== iso2Code) {
        setIsoCode(countryCode);
      }
    }
  }, [countryCode, countryCallingCodes, callingCode, iso2Code, setFormValue]);
  const countryList = useMemo(() => {
    if (!Array.isArray(countryCallingCodes)) return [];

    const kw = keyword?.trim().toLowerCase();

    return countryCallingCodes.filter(it => {
      if (!kw) return true;
      if (it.iso2Code?.toLowerCase() === kw) return true;
      if (it.callingCode === kw) return true;
      return it.name?.toLowerCase().startsWith(kw);
    });
  }, [countryCallingCodes, keyword]);

  const phoneValue = formValue[props.name as keyof typeof formValue]
  React.useEffect(() => {
    if (phoneValue?.startsWith('+' + callingCode) && callingCode) {
      setFormValue({ [props.name!]: phoneValue.replace('+' + callingCode, '') } as unknown as FormValue, props.name!);
    }
  }, [props.name, phoneValue, callingCode, setFormValue]);

  const wrapperRef = useRef<HTMLDivElement>(null); // 引用整个组件
  useClickOutside(wrapperRef, () => {
    if (open) {
      setOpen(false);
    }
  });
  return (
    <div className="w-full" onClick={(event) => event.stopPropagation()}>
      <label
        htmlFor={props.name}
        className={clsx(
          'text-base/[1] transition-all duration-200 px-1 pointer-events-none mb-2 block font-bold',
        )}
      >
        {typeof label === 'string' ? camelToPascalWithSpaces(label ?? '') : label}
      </label>
      <div className={clsx("flex w-full mb-2 relative", open && "z-40")} ref={wrapperRef}>
        <div className={"w-[60px]"}>
          <div
            role="combobox"
            className="relative [--border:218,11%,82%] [--normal-c:hsl(var(--foreground)] [--place:theme(colors.place)] [--focus-c:theme(colors.primary)]"
            onClick={() => setOpen(b => !b)}
          >
            <div
              className={clsx(
                'w-full flex items-center space-x-1 px-3 py-2 rounded-md focus:outline-none transition-all duration-300',
                'border border-[theme(colors.border)] rounded-tr-none rounded-br-none h-[38px] border-r-0',
                'pointer-events-none select-none', open && "rounded-bl-none"
              )}
            >
              <Flag countryCode={iso2Code! ?? 'US'}/>
              <span
                className={clsx("ml-1 inline-block transition-transform group-open:rotate-0", open && "rotate-180")}>
              <Arrow direction="down" className="text-zinc-400"/>
            </span>
            </div>
          </div>
          <div className={clsx(
            "flex-1 w-full h-[50vh] z-10 absolute bg-white [&_.mt-4]:mt-0!",
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
                  countryList.map((it, i) => (
                    <SelectItem
                      key={i}
                      value={it.iso2Code}
                      selected={iso2Code === it.iso2Code}
                      onClick={() => {
                        setIsoCode?.(it.iso2Code);
                        setCallingCode?.(it.callingCode);
                        setFormValue({ ...formValue, callingCode: '+' + it.callingCode }, 'callingCode')
                        setOpen(b => !b);
                      }}
                      className={"rounded-none sm:rounded-lg"}
                    >
                      <div className={"flex space-x-4 items-center text-md justify-between"}>
                      <span className={"flex space-x-2 items-center"}>
                        <Flag countryCode={it.iso2Code}/>
                        <span className={"text-sm"}>{it.name}</span>
                      </span>
                        <span className={"text-base text-zinc-400 pr-2"}>
                        +{it.callingCode}
                      </span>
                      </div>
                    </SelectItem>
                  ))}
              </FlagProvider>
            </SelectSearch>
          </div>
        </div>
        <Input
          {...props}
          label={""}
          layout={"mui"}
          className={clsx('block w-full h-[42px]',
            callingCode && '[&_input]:indent-[42px]!',
            '[&_input]:rounded-tl-none! [&_input]:rounded-bl-none!',
            open && "[&_input]:rounded-br-none!"
          )}
        />
        <div className={'z-10 absolute top-[7px] left-[70px] w-[42px] h-[38px] text-right'}>
          {callingCode && "+"}{callingCode}
        </div>
      </div>
      <InputError>{validateResult?.[props.name as keyof typeof validateResult]}</InputError>
      <div ref={lastPosRef}></div>
    </div>
  );
};

export default CallingCode;
