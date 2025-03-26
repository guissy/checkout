import React from 'react';
import clsx from 'clsx';

type Props = {
  lang: string;
  onChangeLang: (lang: string) => void;
  className?: string
}
const LangSwitch: React.FC<Props> = ({lang, onChangeLang, className}) => {
  return (
    <div title={(lang === 'zh' ? 'Switch to English' : '切换至中文')}
         className={clsx(
           className,
           "font-bold underline cursor-pointer text-right",
           "[--lang-color-txt:#FFFFFF] sm:[--lang-color-txt:theme(colors.primary)]")}
         onClick={() => onChangeLang(lang === 'zh' ? 'en' : 'zh')}>
      {lang === 'zh' ? "ZH" : "CN"}
    </div>
  );
};

export default LangSwitch;
