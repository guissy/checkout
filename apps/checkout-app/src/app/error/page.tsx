import { Suspense } from "react";
import ErrorRetry from "./ErrorRetry";

export default async function ErrorPage(props: {
  searchParams: Promise<{ token: string; reference: string; detail: string }>;
}) {
  const searchParams = await props.searchParams;
  const detail = searchParams.detail
    ? Array.isArray(searchParams.detail)
      ? searchParams.detail[0]
      : searchParams.detail
    : "Please get back to the store and retry your payment.";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorRetry
        detail={detail}
        token={searchParams.token!}
        reference={searchParams.reference!}
      />
    </Suspense>
  );
}
