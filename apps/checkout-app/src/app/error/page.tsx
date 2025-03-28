import React, { Suspense, use } from "react";
import ErrorRetry from "./ErrorRetry";

// 创建内容组件来处理异步逻辑
function ErrorContent(props: {
  searchParams: Promise<{ token: string; reference: string; detail: string }>;
}) {
  const searchParams = use(props.searchParams);
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
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ErrorContent searchParams={props.searchParams} />
    </Suspense>
  );
}
