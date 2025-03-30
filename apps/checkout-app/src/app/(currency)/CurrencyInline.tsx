"use client";

import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { More } from "checkout-ui";
import "./CurrencyInline.css";
import type { CurrencyInfo } from "./CurrencyInfo";
import { reportEvent } from "../../api/reportArms";
import { useLingui } from "@lingui/react";

type Props = {
  value: string;
  onValueChange: (value: { detail: string }) => void;
  onOpen: () => void;
  currencyInfo?: CurrencyInfo[];
  disabled?: boolean;
};
const CurrencyInline: React.FC<Props> = ({
  currencyInfo,
  onOpen,
  value,
  onValueChange,
  disabled,
}) => {
  const { i18n } = useLingui();
  const [showCount, setShowCount] = useState(6);
  const ref = React.useRef<HTMLDivElement>(null);
  const total = currencyInfo?.length || 0;
  const measureShowCount = useCallback(() => {
    if (total > 0 && ref.current?.offsetWidth) {
      let showCount;
      const width = ref.current?.offsetWidth - 2;
      const tagWidth = 45;
      const gapWidth = 10;
      if (width < tagWidth * 2 + gapWidth) {
        showCount = 1;
      } else if (width < tagWidth * 3 + gapWidth * 2) {
        showCount = 2;
      } else if (width < tagWidth * 4 + gapWidth * 3) {
        showCount = 3;
      } else if (width < tagWidth * 5 + gapWidth * 4) {
        showCount = 4;
      } else if (width < tagWidth * 6 + gapWidth * 5) {
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
    window.addEventListener("resize", measureShowCount);
    return () => {
      window.removeEventListener("resize", measureShowCount);
    };
  });
  const index = currencyInfo?.findIndex(
    (currency) => currency.currencyCode === value,
  );
  if (
    total > 0 &&
    total > showCount &&
    Array.isArray(currencyInfo) &&
    index! >= showCount
  ) {
    currencyInfo.splice(showCount - 1, 1, currencyInfo[index!]);
  }
  return (
    <div
      className={clsx("mt-2 flex space-x-2 *:rounded-full *:text-xs/[1]")}
      ref={ref}
    >
      {Array.isArray(currencyInfo) &&
        currencyInfo.slice(0, showCount).map((currency) => (
          <div
            key={currency.currencyCode}
            title={
              i18n.locale === "zh"
                ? currency?.currencyName
                : currency?.currencyNameEn
            }
            className={clsx(
              "animation-fade-slide shrink-0 border border-[#CCCFD5] has-checked:border-[transparent] has-checked:bg-[#1A1919]",
              "hover:shadow-sm hover:shadow-white/80 text-[#737C8B] has-checked:text-white",
              "cursor-pointer peer transition-colors duration-300 ease-in-out",
              value === currency.currencyCode
                ? "bg-[#1A1919] text-white"
                : "hover:bg-[#1A1919]/10",
            )}
          >
            <label
              className={clsx(
                "px-2.5 py-[5px] inline-block has-checked:font-bold uppercase cursor-pointer",
              )}
            >
              <input
                className="appearance-none sr-only"
                type="radio"
                name={"currency"}
                value={currency.currencyCode}
                checked={value === currency.currencyCode}
                disabled={disabled}
                onChange={() => {
                  onValueChange?.({ detail: currency.currencyCode });
                  void reportEvent("currency_change", {
                    currencyCode: currency.currencyCode,
                  });
                }}
              />
              {currency.currencyCode}
            </label>
          </div>
        ))}
      {total > 0 && total > showCount && (
        <More
          alt="More"
          className={clsx(
            "cursor-pointer hover:opacity-75 order-[2000]",
            "animation-fade-slide",
          )}
          aria-controls="CurrencySelectDialog"
          aria-label="More"
          onClick={onOpen}
        />
      )}
    </div>
  );
};

export default CurrencyInline;
