'use client';

import React, { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { getLifeStagePhaseCN, type PayMethod, TransactionType } from '../checkout/fp-checkout-type';
import clsx from 'clsx';
import Image from 'next/image';
import { Divider, MoreLite } from 'checkout-ui';
import { getIcon } from './PayIconMap';
import AlipayType from './AlipayType';
import Alipay from "./ali/Alipay+.svg";
import isMobileScreen from '../../utils/isMobileScreen';
import useAnimateDetails from '@/utils/useAnimateDetails';


type Props = {
  className: string;
  item: PayMethod;
  currentPay?: PayMethod;
  checked?: boolean;
  isInit?: boolean;
  index?: number;
  onlyOne?: boolean;
  onCurrentPay: (pay: PayMethod, focus: boolean, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}
const PayMethodCard: React.FC<PropsWithChildren<Props>> = ({
                                                             item,
                                                             onCurrentPay,
                                                             currentPay,
                                                             checked,
                                                             className,
                                                             isInit,
                                                             index,
                                                             onlyOne,
                                                             children,
                                                           }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const onClick = useAnimateDetails(detailsRef);
  const [showCount, setShowCount] = useState(0);
  const total = item.cards?.length || 0;
  const measureShowCount = useCallback(() => {
    if (total > 0 && ref.current?.offsetWidth) {
      let showCount;
      const width = ref.current?.offsetWidth;
      if (width < 120) {
        showCount = 1;
      } else if (width < 160) {
        showCount = 2;
      } else if (width < 200) {
        showCount = 3;
      } else if (width < 240) {
        showCount = 4;
      } else if (width < 280) {
        showCount = 5;
      } else {
        showCount = 6;
      }
      setShowCount(showCount);
    }
  }, [total]);
  React.useEffect(() => {
    measureShowCount();
  }, [measureShowCount]);
  useEffect(() => {
    window.addEventListener('resize', measureShowCount);
    return () => {
      window.removeEventListener('resize', measureShowCount);
    };
  });
  const noShadow = ['googlepayus'].includes(item.type?.toLowerCase());
  const bgColor = getIcon(item.type, item.platformName)?.[1];
  const isMobile = isMobileScreen();

  useEffect(() => {
    if (!isInit && checked) {
      console.info('scroll to', top);
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [checked, isInit, index, isMobile]);
  const isAli = AlipayType.includes(item.type?.toLowerCase())
  return item.type ? (
    <>
      <div className={'h-4'} ref={containerRef}/>
      <div className={className}>
        <details ref={detailsRef}>
          <summary ref={summaryRef} className={'marker-none'} onClick={() => onClick}>
            <div className="cursor-pointer inline-block w-full" onClick={(e) => {
              const otherToBankTransfer = currentPay?.transactionType !== TransactionType.bankTransfer && item?.transactionType === TransactionType.bankTransfer
              const isOpen = detailsRef.current?.open;
              const isClickMore = e.detail === 9527;
              // const isClickCard = e.detail === 9981;
              if (otherToBankTransfer && isOpen || (!isClickMore) && isOpen) {
                e.stopPropagation();
                e.preventDefault();
              }
              onCurrentPay(item, false, e);
            }}>
              <div
                className={clsx('flex items-center space-x-2 justify-between px-4 sm:px-6',
                  checked ? 'py-4 sm:py-6' : 'py-2.5')}>
                <div className={"flex justify-center items-center"}>
                  {
                    getIcon(item.type, item.platformName)
                      ?
                      <div
                        className={clsx(
                          "inline-block",
                          noShadow ? "" : "rounded-full overflow-hidden shadow-[0_0_6px_rgba(102,145,231,0.12)]",
                          !noShadow && bgColor !== '#fff' && 'shadow-[0_1px_6px_rgba(102,145,231,0.30)]!',
                          "size-10 flex items-center justify-center *:w-full *:h-full *:rounded-[8px]"
                        )}
                        style={{
                          backgroundColor: bgColor
                        }}
                        // dangerouslySetInnerHTML={{ __html: getIcon(item.type, item.platformName)?.[0] }}
                      >
                        <Image src={getIcon(item.type, item.platformName)?.[0]} alt="" />
                      </div>
                      :
                      <Image
                        src={item.iconUrl?.trim()} alt={item.type} title={item.platformName}
                        className={clsx(
                          "inline-block rounded-lg my-[11px] shadow-[0_0_6px_rgba(102,145,231,0.12)]",
                          "sm:my-0 size-10 flex items-center justify-center object-contain"
                        )}
                      />
                  }
                </div>
                <div className={clsx(isAli ? 'w-[calc(100%-146px)]' : 'w-[calc(100%-72px)]')} ref={ref}>
                  <h3 className="font-bold text-sm/[1] sm:text-base/[1] w-full truncate" title={item.platformName}>{item.platformName}</h3>
                  <p
                    className="text-xs/[1] sm:text-sm/[1] mt-2 text-[#BAB9C1]">{getLifeStagePhaseCN()[item.transactionType!] || item.transactionType}</p>
                  <picture className={clsx(
                    'flex mt-4 space-x-2 lg:w-[320px] empty:hidden',
                    '*:shrink-0 *:bg-white',
                  )}>
                    {
                      item.cards?.slice(0, showCount).map((card, i) => (
                        <div key={card.type + '_' + i}
                             title={card.type}
                             className={clsx(
                               'border border-[#D5E3F2] w-[32px] h-[22px] items-center justify-center rounded-[3px]',
                               'data-[state=active]:border-primary',
                             )}
                             data-state={currentPay?.type === card.type ? 'active' : ''}
                             onClick={(e) => {
                               const isOpen = detailsRef.current?.open;
                               if (isOpen) {
                                 e.stopPropagation();
                                 e.preventDefault();
                               }
                               onCurrentPay(card as PayMethod, false, e);
                             }
                             }>
                          <Image src={card.iconUrl} alt={card.type}
                                 className="object-cover w-full h-auto max-h-[20px] rounded-[3px] text-xs indent-1 bg-silver leading-6 text-place"/>
                        </div>
                      ))
                    }
                    {total > 0 && <MoreLite
                      onClick={(e: React.MouseEvent<HTMLOrSVGElement>) => {
                        e.detail = 9527;
                      }}
                      alt=""
                      className={clsx('cursor-pointer w-[32px] h-[22px] grid place-items-center border border-[#D5E3F2] rounded-[3px]')}
                    />}
                  </picture>
                </div>
                <div className="flex items-center justify-end">
                  {isAli && (<Image
                      className={clsx(
                        "h-7 flex items-center justify-center *:w-full *:h-full max-w-[80px] sm:max-w-[120px]",
                        "transform -translate-y-px pr-3 sm:pr-4"
                      )}
                      alt=""
                      src={Alipay}
                    />
                  )}
                  {/*<div className="px-4 -mr-4 sm:hidden" onClick={onClickArrow}>*/}
                  {/*  <Arrow direction="right" className={"inline text-[#BAB9C1] sm:hidden h-10"}/>*/}
                  {/*</div>*/}
                  <label className={"hidden"} htmlFor={item.type}>{item.platformName}</label>
                  <input type="radio" name="type" value={item.type}
                         checked={checked}
                         onChange={() => {
                         }} id={item.type}
                         className="sr-only size-4 ml-auto accent-white max-sm:hidden shrink-0 cursor-pointer"/>
                  <div className={clsx("relative size-4", onlyOne && "hidden")}>
                    <div
                      className={`absolute inset-0 rounded-full border ${
                        checked ? 'bg-[#1A1919]' : 'border-[#CCCFD5]'
                      }`}
                    />
                    {checked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {total > 0 &&
              <div className={'border-t border-[#D5E3F2]'}>
                <div>
                  <div className="empty:hidden px-6 py-6 sm:py-8 grid grid-cols-4 sm:grid-cols-6 gap-6">
                    {
                      item.cards?.map((card, i) => (
                        <div
                          key={card.type + '_' + i}
                          title={card.type}
                          className={clsx(
                            "flex items-center justify-center relative h-[46px] min-w-[46px]",
                            "cursor-pointer rounded transition-all duration-300 ease-in-out",
                            'ring-2 ring-white data-[state=active]:ring-primary shadow-[0_0_14px_rgba(0,102,255,0.06)]')}
                          data-state={currentPay?.type === card.type ? 'active' : ''}
                          onClick={(e) => {
                            onCurrentPay(card as PayMethod, true, e);
                          }}
                        >
                          <Image src={card.iconUrl} alt={card.type}
                                 className="object-contain w-full max-h-[44px] text-xs indent-1 bg-white leading-6 text-place"/>
                          {currentPay?.type === card.type &&
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                                 className={'absolute right-1 top-1 animate-in fade-in duration-300'}>
                              <path
                                d="M6 0C2.6863 0 0 2.6863 0 6C0 9.31373 2.6863 12 6 12C9.31373 12 12 9.31373 12 6C12 2.6863 9.3137 0 6 0ZM9.44146 4.44367L5.56094 8.32421C5.56094 8.32421 5.5609 8.32426 5.56082 8.32433C5.38193 8.50327 5.10914 8.53121 4.9009 8.40821C4.86233 8.38541 4.82597 8.35742 4.79285 8.32433C4.79282 8.32428 4.79278 8.32426 4.79278 8.32426L2.55857 6.09005C2.3465 5.87798 2.3465 5.53411 2.55857 5.322C2.77063 5.10994 3.1145 5.10994 3.32657 5.322L5.17687 7.1723L8.67348 3.6757C8.88557 3.46363 9.22944 3.46363 9.4415 3.6757C9.65352 3.88776 9.65352 4.23161 9.44146 4.44367Z"
                                fill="#326FF6"/>
                            </svg>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>}

            {checked &&
              <Divider className={'mx-4'}/>
            }
            {checked && children}
          </summary>
        </details>
      </div>
    </>
  ) : (<span className={"bg-destructive text-destructive-foreground px-6 py-4 rounded-md text-center"}>
    This payment method is not available.
  </span>);
};

export default PayMethodCard;
