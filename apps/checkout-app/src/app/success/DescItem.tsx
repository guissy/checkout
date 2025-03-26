import React, { type PropsWithChildren } from 'react';
import clsx from 'clsx';

type Props = {
  className?: string
}
const DescItem: React.FC<PropsWithChildren<Props>> = ({children, className}) => {
  return (
      <div className={clsx("flex justify-between py-[10px]", className)}>
        {children}
      </div>
  );
};

export default DescItem;
