'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Arrow, camelToPascalWithSpaces, InputError, type InputProps, SelectItem, SelectSearch } from 'checkout-ui';
import { FlagProvider } from '../(flag)/Flag';
import clsx from 'clsx';
import { type ValidateResult } from './validateNeedField';
import { type FormValue } from '../checkout/fp-checkout-type';
import BankIcon from './BankIcon';
import useClickOutside from '../../utils/onClickOutside';

export type SupportedBankInfo = { name: string, description: string, bankCode: string }

type Props = {
  validateResult: ValidateResult;
  formValue: FormValue;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  supportedBankList?: SupportedBankInfo[];
} & InputProps
const SupportedBank: React.FC<Props> = ({ validateResult, formValue, setFormValue, label, supportedBankList, ...props }) => {
  const [keyword, setKeyword] = useState('');
  const [supportedBank, setSupportedBank] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);
  const lastPosRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) lastPosRef.current?.parentElement?.scrollIntoView({ behavior: 'smooth' });
  }, [open]);

  const selectedBank = useMemo(() => {
    return supportedBankList?.find((it: SupportedBankInfo) => it.bankCode === supportedBank);
  }, [supportedBankList, supportedBank])
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
            aria-controls="country-list"
            aria-expanded={open}
            className="relative [--border:218,11%,82%] [--normal-c:hsl(var(--foreground)] [--place:theme(colors.place)] [--focus-c:theme(colors.primary)]"
            onClick={() => setOpen(b => !b)}
          >
            <div
              className={clsx(
                'w-full flex items-center justify-between space-x-1 px-3 py-2 rounded-md focus:outline-none transition-all duration-300',
                'border border-[theme(colors.border)] h-[42px]',
                'pointer-events-none select-none', open && "rounded-bl-none rounded-br-none"
              )}
            >
              <span className={"inline-block size-[24px] *:rounded-[6px]"}><BankIcon name={selectedBank?.bankCode || ''} /></span>
              <span className={"truncate pl-2 flex-1 text-sm/[1]"}>{selectedBank?.name}</span>
              <span
                className={clsx("inline-block transition-transform group-open:rotate-0", open && "rotate-180")}>
              <Arrow direction="down" className="text-zinc-400"/>
            </span>
            </div>
          </div>
          <div className={clsx(
            "flex-1 w-full max-h-[50vh] z-10 absolute bg-white [&_.mt-4]:mt-0!",
            "[&_input]:rounded-none [&_.pt-4]:pt-0! -mt-0.5",
            open ? "" : "hidden")
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
                  Array.isArray(supportedBankList) &&
                  supportedBankList
                    ?.filter(it => it.bankCode?.toLowerCase().includes(keyword.toLowerCase()))
                    ?.map((it, i) => (
                    <SelectItem
                      key={i}
                      value={it.bankCode}
                      selected={supportedBank === it.bankCode}
                      onClick={() => {
                        setSupportedBank?.(it.bankCode);
                        setFormValue({ ...formValue, [props.name as keyof FormValue]: it.bankCode }, props.name as keyof FormValue)
                        setOpen(b => !b);
                      }}
                      className={"rounded-none! sm:rounded-lg"}
                    >
                      <div className={"flex space-x-4 items-center text-sm justify-between"}>
                        <span className={"size-8 *:rounded-[6px]"}><BankIcon name={it.bankCode} /></span>
                        <span className={"flex-1 items-center"}>
                          {it.name}
                        </span>
                        <span className={"text-base text-zinc-400 pr-2"}>
                          {it.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </FlagProvider>
            </SelectSearch>
            {/*<div className={"w-full h-4"} />*/}
          </div>
        </div>
      </div>
      <InputError>{validateResult?.[props.name as keyof typeof validateResult]}</InputError>
      <div ref={lastPosRef}></div>
    </div>
  );
};

export default SupportedBank;
