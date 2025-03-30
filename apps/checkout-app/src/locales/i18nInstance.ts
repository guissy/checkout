import { I18n } from "@lingui/core";

let _i18n: I18n;
export const getI18n = () => {
  return _i18n;
};
export const setI18n = (i18n: I18n) => {
  _i18n = i18n;
};
