import React from "react";
import ArrowBack from "@/components/svg/ArrowBackIcon.svg";
import { cn } from "@/lib/utils";

const HeaderPhone: React.FC<{
  title: string;
  className?: string;
  onBack: () => void;
}> = ({ title, className, onBack }) => {
  return (
    <header
      className={cn(
        "top-0 z-10 bg-white h-[68px] w-full px-6 flex items-center",
        className
      )}
    >
      <ArrowBack onClick={onBack} />
      <h1 className="ml-4 text-lg font-bold truncate">{title}</h1>
    </header>
  );
};

export default HeaderPhone;
