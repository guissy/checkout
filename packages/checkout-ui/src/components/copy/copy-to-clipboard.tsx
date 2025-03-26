import React, { useState } from 'react';
import CopyBefore from './CopyBefore.svg';
import CopyAfter from './CopyAfter.svg';

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text || '');
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`inline-block ml-1 text-sm leading-3`}
    >
      {!isCopied
        ? <CopyBefore className={"size-3.5 inline-block"} />
        : (
          <CopyAfter className={"inline-block"} />
        )}
    </button>
  );
};

export default CopyToClipboard;
