'use client';

import React, { createContext } from 'react';
import flag_top50 from './flag_top50.svg?raw';

const FlagContext = createContext<{top50: string; other: string}>({ top50: flag_top50, other: '' });

export const FlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flagData, setFlagData] = React.useState<{top50: string; other: string}>({ top50: flag_top50, other: '' });
  const [loading, setLoading] = React.useState(false);
  
  const loadAdditionalFlags = React.useCallback(async () => {
    if (loading || flagData.other !== '') return;
    
    try {
      setLoading(true);
      const svgFile = await import('./flag_other.svg?raw');
      setFlagData(prev => ({ ...prev, other: svgFile.default }));
    } catch (e) {
      console.error('Error loading additional flags:', e);
    } finally {
      setLoading(false);
    }
  }, [loading, flagData.other]);

  React.useEffect(() => {
    void loadAdditionalFlags();
  }, [loadAdditionalFlags]);

  return (
    <FlagContext.Provider value={flagData}>
      <div
        className="absolute bottom-0 right-0 -z-10 size-0 hidden"
        dangerouslySetInnerHTML={{ __html: flagData.top50 }}
      />
      <div
        className="absolute bottom-0 right-0 -z-10 size-0 hidden"
        dangerouslySetInnerHTML={{ __html: flagData.other }}
      />
      {children}
    </FlagContext.Provider>
  );
};

interface FlagProps {
  countryCode: string;
}

const Flag: React.FC<FlagProps> = ({ countryCode }) => {
  // 确保国家代码是小写的
  const normalizedCountryCode = React.useMemo(() => 
    countryCode.toLowerCase(), [countryCode]);

  return (
    <svg
      width={20}
      height={15}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 480"
      className="inline-block"
    >
      <use href={`#flag_${normalizedCountryCode}`} />
    </svg>
  );
};

export default Flag;

