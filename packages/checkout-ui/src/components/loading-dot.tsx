import React, { type PropsWithChildren } from 'react';

const LoadingDot: React.FC<PropsWithChildren> = () => {
  return (
    <div
      className={"fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 text-zinc-500"}>
      Loading...
    </div>
  );
};

export default LoadingDot;
