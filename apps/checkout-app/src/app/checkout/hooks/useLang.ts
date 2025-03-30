import { useLingui } from "@lingui/react";
import Cookies from "js-cookie";

export const useLang = () => {
  const { i18n } = useLingui();

  const onChangeLang = (newLang: string) => {
    i18n.activate(newLang);
    Cookies.set("lang", newLang);
    document.documentElement.lang = i18n.locale;
    document.title = i18n.t("site.title");
  };

  return {
    lang: i18n.locale,
    onChangeLang,
  };
};
