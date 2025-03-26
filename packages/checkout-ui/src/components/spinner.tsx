import { SpinnerCycle } from '@/index';
import React, { type PropsWithChildren } from 'react';

const Spin: React.FC<PropsWithChildren & { spinning: boolean}> = ({ children, spinning }) => {
  return spinning ? (
    <SpinnerCycle
      className="animate-spin h-5 w-5 text-gray-500"
    />
  ) : children;
};

export default Spin;
