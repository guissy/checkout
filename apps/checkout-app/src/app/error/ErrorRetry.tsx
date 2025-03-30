"use clinent";

import React from "react";
import ErrorXCycle from "./ErrorXCycle.svg";
import Image from "next/image";
import ErrorAction from "./ErrorAction";
import { Trans } from "@lingui/react";

type Props = {
  detail: React.ReactNode;
  token: string;
  reference: string;
  isHome?: boolean;
};
const ErrorRetry: React.FC<Props> = ({ detail, token, reference, isHome }) => {
  return (
    <div>
      <div
        className={
          "w-full h-[426px] bg-primary text-white flex items-center justify-center"
        }
      >
        <div>
          <Image src={ErrorXCycle} alt="" />
          <div className={"text-center"}>
            <h2 className={"font-bold text-[22px]"}>
              <Trans id="failure.title" message={"Payment Failed"}></Trans>
            </h2>
            <p className={"mt-4 text-white/70"}>
              <Trans
                id={"failure.request_again"}
                message="Please request the transaction again"
              />
            </p>
          </div>
        </div>
      </div>
      <div className={"mt-6 mb-10 text-center mx-6"}>{detail}</div>
      <div className="flex justify-center mx-6 space-x-4 text-lg/[30px] font-semibold text-white pb-10">
        <ErrorAction token={token} reference={reference} isHome={isHome} />
      </div>
    </div>
  );
};

export default ErrorRetry;
