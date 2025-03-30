"use client";

import { Arrow } from "checkout-ui";
import type { CountryInfo } from "../../api/fetchCountryInfoList.ts";
import clsx from "clsx";
import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react";
import { i18n } from "@lingui/core";

export const CountryLink: FC<{
  country?: CountryInfo;
  openAreaDialog: () => void;
  className?: string;
}> = ({ country, openAreaDialog, className }) => {
  const [isOverflowed, setIsOverflowed] = useState(false);
  const textRef = useRef<HTMLHeadingElement>(null);

  // 使用 ResizeObserver 检测文本溢出
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const hasOverflow = entry.target.scrollWidth > entry.target.clientWidth;
        setIsOverflowed(hasOverflow);
      }
    });

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, []);

  // 只在 country 变化时重新检查溢出
  useEffect(() => {
    if (textRef.current) {
      const hasOverflow =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsOverflowed(hasOverflow);
    }
  }, [country]);

  const handleClick = useCallback(() => {
    openAreaDialog();
  }, [openAreaDialog]);

  const countryName = country
    ? (i18n.locale === "zh" ? country.countryNameCn : country.countryNameEn) ||
      country.iso2Code ||
      "-"
    : "-";

  return (
    <div
      className={clsx(
        "flex justify-between items-center country-link-container",
        className,
      )}
    >
      <h2
        className={clsx(
          "text-lg sm:text-2xl font-semibold flex-1 truncate text-primary relative inline-block",
          isOverflowed ? "pr-4" : "",
        )}
        ref={textRef}
      >
        {isOverflowed && (
          <Arrow
            direction="down"
            className="absolute top-[11px] sm:top-[14px] right-1"
          />
        )}
        <>
          <span className="inline pr-2 text-body font-normal">
            <Trans id="Most popular in" />
          </span>
          <span
            className={clsx(
              "space-x-2 cursor-pointer",
              "relative after:absolute after:bottom-px after:content-[''] after:h-px after:left-0 after:w-full after:bg-primary",
              "truncated",
            )}
            onClick={handleClick}
            title={country?.iso2Code}
            key={country?.iso2Code}
          >
            {countryName}
            <span />
            <Arrow
              direction="down"
              className={isOverflowed ? "hidden" : "inline"}
            />
          </span>
        </>
      </h2>
    </div>
  );
};
