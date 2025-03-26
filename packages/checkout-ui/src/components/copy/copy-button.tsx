import React, { type PropsWithChildren } from 'react';
import Spin from '../spinner';
import CopyToClipboard from './copy-to-clipboard';

const CopyButton: React.FC<PropsWithChildren & { spinning: boolean}> = ({ children, spinning }) => {
  const [text, setText] = React.useState('');
  return spinning ? (
    <Spin spinning={spinning} />
  ) : <span className={"inline-flex items-center text-right"}>
    <span ref={ref => setText(ref?.innerText || '')}
    style={{ wordBreak: 'break-all' }}>
      {children}
    </span>
    <CopyToClipboard text={text} />
  </span>;
};

export default CopyButton;
