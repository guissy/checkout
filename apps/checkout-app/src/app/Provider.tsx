"use client";

import React, { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { i18n } from "@lingui/core";
import { StoreProvider } from "@/store/StoreProvider";

// 不需要在某些特定页面显示导航的路径
const PATHS_WITHOUT_NAV = ["/404"]; //['/success', '/complete', '/error'];

// Provider
const Provider: React.FC<PropsWithChildren> = ({ children }) => {
  i18n.activate("zh");
  const pathname = usePathname();
  const shouldShowNav = !PATHS_WITHOUT_NAV.some((path) =>
    pathname?.startsWith(path),
  );
  console.log(pathname, "Provider: 🐭🐭🐭");
  return (
    <TooltipProvider>
      <StoreProvider>
        {shouldShowNav && <Navigation />}
        {children as React.ReactElement}
        <Toaster position="top-right" />
      </StoreProvider>
    </TooltipProvider>
  );
};
export default Provider;
