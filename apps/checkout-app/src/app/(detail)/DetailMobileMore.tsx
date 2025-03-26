'use client';

import React, { type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Arrow, Divider, PayToIcon } from 'checkout-ui';
import clsx from 'clsx';

type Props = {
  origin?: string;
  productName?: string;
  productDetail?: string;
  showDetailMore: boolean;
  setShowDetailMore: (show: boolean) => void;
}
const DetailMobileMore: React.FC<PropsWithChildren<Props>> = ({
                                                                origin,
                                                                productName,
                                                                productDetail,
                                                                children,
                                                                showDetailMore,
                                                                setShowDetailMore
                                                              }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };
  const [isOverflowed, setIsOverflowed] = useState(false);
  const checkOverflow = useCallback((textElement: HTMLElement | null) => {
    if (textElement) {
      const hasOverflow = textElement.scrollHeight > textElement.clientHeight;
      setIsOverflowed(hasOverflow);
    }
  }, []);
  useEffect(() => {
    if (showDetailMore) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailMore]);
  return <>
    {showDetailMore &&
      <div className={'bg-black/50 fixed z-50 top-0 w-full h-full sm:hidden'}
           aria-hidden="true" onClick={() => setShowDetailMore(false)}>
        {/** 蒙层 */}
      </div>}
    {/** 📱移动端📱 标题详情 */}
    <div className={clsx('sm:hidden bg-white fixed z-50 top-0 w-screen',
      showDetailMore ? 'slide-in-down' : 'slide-out-up')}>
      <div className={'flex items-center justify-between px-(--px1) h-[60px] leading-[60px]'}>
        <div className={'flex-1 flex items-center space-x-2'}>
          <PayToIcon className={"text-white bg-black rounded-full size-[28px]"}/>
          <div className={"flex-1 flex flex-col"}>
            <p
              className="text-base/[1] font-bold empty:invisible">{origin}</p>
          </div>
        </div>
        <div className={'flex-1 flex items-center justify-end'} onClick={() => setShowDetailMore(false)}>
          <Arrow direction={'up'}/>
        </div>
      </div>
      <div
        className={clsx("px-(--px1) border-t border-[#CCCFD5]", (productName || productDetail) ? "py-(--px1)" : 'pb-4')}>
        {(productName || productDetail) &&
          <div className="flex items-center space-x-2.5">
            <div className={'space-y-2'} style={{ wordBreak: 'break-word' }}>
              <p
                className="font-semibold text-base/[1] break-words"
                title={productName}
              >
                {productName}
              </p>
              <p
                className={clsx("text-[#1A1919] text-xs relative break-words line-clamp-2",
                  isOverflowed && (isExpanded ? "pr-[4px] line-clamp-none!" : "pr-[4px]"))}
                title={productDetail}
                ref={checkOverflow}
              >
                {productDetail}
                {isOverflowed && <div
                  onClick={toggleExpand}
                  className="absolute -bottom-1 -right-1.5 p-2"
                >
                  <Arrow direction={'down'}
                         className={clsx('transform transition-transform duration-200',
                           (isExpanded ? 'rotate-0!' : 'rotate-180!'))}/>
                </div>}
              </p>
            </div>
          </div>}
      </div>
      {(productName || productDetail) &&
        <Divider className={'mx-4 px-(--px1) mb-[18px]'} width={window.innerWidth - 32}/>}
      <div className={'px-4'}>
        {children}
      </div>
    </div>
  </>
};

export default DetailMobileMore;
