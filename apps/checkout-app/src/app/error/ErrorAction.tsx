"use client";

import { clearSessionStorage } from "@/utils/gotoTimeout";
// import { Trans } from "@lingui/react";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  token: string
  reference: string
  isHome?: boolean
}
const ErrorAction: React.FC<Props> = ({ token, reference, isHome }) => {
  const router = useRouter();
  return (
    <>
      <a
        href={"javascript:history.back()"}
        onClick={() => {
          clearSessionStorage();
          const returnUrl = window.sessionStorage.getItem("returnUrl");
          if (returnUrl) {
            window.location.href = returnUrl;
          }
        }}
        className="px-6 py-1.5 text-center text-primary bg-white border border-primary rounded-lg flex-1 max-w-[214px] cursor-pointer select-none"
      >
        {/* <Trans id={"failure.store"} message="Store" /> */}
        Store
      </a>
      <a
        onClick={() => {
          if (isHome || (!token && !reference)) {
            window.location.reload()
          }  else { 
            router.push(`/?token=${token}`);
          }
          window.sessionStorage.removeItem("route");
        }}
        className="px-6 py-1.5 text-center bg-primary rounded-lg flex-1 max-w-[214px] cursor-pointer select-none"
      >
        {/* <Trans id={"failure.retry"} message="Retry" /> */}
        Retry
      </a>
    </>
  );
};

export default ErrorAction;
