import React, { Suspense } from "react";
import ErrorRetry from "./ErrorRetry";
import { initLingui } from "@/locales/initLingui";
import Cookies from "js-cookie";
import { LoadingPage } from "checkout-ui";

// 创建内容组件来处理异步逻辑
async function ErrorContent(props: {
  searchParams: Promise<{ token: string; reference: string; detail: string }>;
}) {
  const searchParams = await props.searchParams;
  const detail = searchParams.detail
    ? Array.isArray(searchParams.detail)
      ? searchParams.detail[0]
      : searchParams.detail
    : "Please get back to the store and retry your payment.";

  return (
    <ErrorRetry
      detail={detail}
      token={searchParams.token!}
      reference={searchParams.reference!}
    />
  );
}

export default function ErrorPage(props: {
  searchParams: Promise<{ token: string; reference: string; detail: string }>;
}) {
  initLingui(Cookies.get("lang") || "zh");
  return (
    <Suspense fallback={<LoadingPage />}>
      <ErrorContent searchParams={props.searchParams} />
    </Suspense>
  );
}
