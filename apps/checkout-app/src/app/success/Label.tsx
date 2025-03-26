import React, { type PropsWithChildren } from 'react';


const Label: React.FC<PropsWithChildren> = ({ children}) => {
  return (
      <span className={"text-primary opacity-50"}>
        {children}
      </span>
  );
};

export default Label;
