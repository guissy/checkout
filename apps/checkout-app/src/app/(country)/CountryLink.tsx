'use client';

import { Arrow } from 'checkout-ui';
import type { CountryInfo } from '../../api/fetchCountryInfoList.ts';
import clsx from 'clsx';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { Trans } from "@lingui/react/macro";
import { i18n } from '@lingui/core';

export const CountryLink: FC<{
  country?: CountryInfo,
  openAreaDialog: () => void,
  className?: string
}> = ({ country, openAreaDialog, className }) => {
  const [isOverflowed, setIsOverflowed] = useState(false);
  const checkOverflow = useCallback((textElement: HTMLElement | null) => {
    if (textElement) {
      const hasOverflow = textElement.scrollWidth > textElement.clientWidth;
      setIsOverflowed(hasOverflow);
    }
  }, []);

  return (
    <div className={clsx('flex justify-between items-center country-link-container', className)}>
      <h2 className={clsx("text-lg sm:text-2xl font-semibold flex-1 truncate text-primary relative inline-block",
          isOverflowed ? 'pr-4' : '')}
          ref={(textElement) => checkOverflow(textElement)}>
        {isOverflowed && <Arrow direction="down" className={"absolute top-[11px] sm:top-[14px] right-1"}/>}
        <Trans>
          <span className="inline pr-2 text-body font-normal">Most popular in</span>
          <span className={clsx("space-x-2 cursor-pointer",
            "relative after:absolute after:bottom-px after:content-[''] after:h-px after:left-0 after:w-full after:bg-primary",
            "truncated"
          )}
                onClick={openAreaDialog} title={country?.iso2Code} key={country?.iso2Code}>
          {(i18n.locale === 'zh' ? country?.countryNameCn : country?.countryNameEn) || country?.iso2Code || '-'}
            <span/>
            <Arrow direction="down" className={isOverflowed ? "hidden" : "inline"}/>
          </span>
        </Trans>
      </h2>
    </div>
  )
}
