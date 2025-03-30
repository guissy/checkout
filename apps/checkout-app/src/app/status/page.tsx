// 'use client';

import React, { use, Suspense } from "react";
import { LoadingPage, PayToIcon } from "checkout-ui";
import { camelCase, capitalize } from "lodash";
import { useLingui } from "@lingui/react";
import { TradeStatusCN } from "@/enums/TradeStatus";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// 创建内容组件来处理异步逻辑
const StatusContent: React.FC<{
  searchParams: SearchParams;
}> = (props) => {
  const searchParams = new Map(Object.entries(use(props.searchParams)));
  const reference = searchParams.get("pspReference");
  const merchantId = searchParams.get("merchantId");
  const domain = searchParams.get("domain");
  const orderStatus = searchParams.get("orderStatus") as string;
  const origin = searchParams.get("origin");
  const str =
    TradeStatusCN[
      capitalize(camelCase(orderStatus!)) as keyof typeof TradeStatusCN
    ];
  const { i18n } = useLingui();
  console.log("str", str, i18n.locale, i18n.t(str));
  return (
    <main className="h-full">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="">
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <PayToIcon className="bg-white rounded-full text-6xl" />
            </div>
            <p className="text-lg font-medium text-zinc-600">Payment for</p>
            <a href={(domain as string) || ""} className="font-bold">
              {origin}
            </a>
          </div>

          <div className="bg-white shadow-sm rounded-lg max-w-md mx-auto">
            <div className="p-10">
              <p className="text-sm text-zinc-600 mb-2">
                Psp reference: <span className="font-bold">{reference}</span>
              </p>
              <p className="text-sm text-zinc-600">
                Merchant ID{" "}
                <strong className="font-medium">(from store)</strong>:{" "}
                <span className="font-bold">{merchantId}</span>
              </p>
            </div>
            <div className="p-10 border-t border-gray-200 font-semibold">
              <h2 className="mb-4">Payment status</h2>
              <p className="text-2xl font-bold mb-8 capitalize">
                {orderStatus}
              </p>
              <p>{i18n.t(str)}</p>
            </div>
          </div>

          <p className="mt-10 text-zinc-500 text-center flex items-center justify-center space-x-2">
            <span>Powered by</span>
            {/* <FuturePayLogo /> */}
          </p>
        </div>
      </div>
    </main>
  );
};

const Status: React.FC<{
  searchParams: SearchParams;
}> = (props) => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <StatusContent searchParams={props.searchParams} />
    </Suspense>
  );
};

export default Status;
