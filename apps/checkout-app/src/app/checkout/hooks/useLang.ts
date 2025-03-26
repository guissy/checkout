import { useState } from 'react';
import { i18n } from '@lingui/core';

export const useLang = () => {
  const [lang, setLang] = useState<string>('en');

  const onChangeLang = (newLang: string) => {
    setLang(newLang);
    i18n.activate(newLang);
    document.documentElement.lang = i18n.locale;
    document.title = i18n.t("site.title");
  };

  return {
    lang,
    onChangeLang
  };
};
