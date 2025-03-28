"use client";

import React, {
  StrictMode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormValue, PayMethod } from "./fp-checkout-type";
import { NMI } from "./fp-checkout-type";
import { CountryLink } from "../(country)/CountryLink";
import clsx from "clsx";
import { Arrow, Dialog, Divider, HeaderPhone, PayToIcon } from "checkout-ui";
import CurrencyExchangeModal from "../(currency)/CurrencyExchangeModal";
import PayMethodCard from "../(method)/PayMethodCard";
import CurrencyInline from "../(currency)/CurrencyInline";
import CountrySelect from "../(country)/CountrySelect";
import CurrencySelect from "../(currency)/CurrencySelect";
import Amount from "./Amount";
import CustomerForm from "../(form)/CustomerForm";
import PayBtn from "./PayBtn";
import { useValidateResult } from "../(form)/useValidateForm";
import { i18n } from "@lingui/core";
import { Trans } from "@lingui/react";
import isMobileScreen from "../../utils/isMobileScreen";
import { isDebug } from "../../utils/isDev";
import LangSwitch from "../(country)/LangSwitch";
import { reportEvent } from "../../api/reportArms";
import useKeyboardStatus from "../../utils/useKeyboardStatus";
import useLoadingValue from "../../utils/useLoadingValue";
import useSessionState from "../../utils/useSessionState";
import ErrorRetry from "../error/ErrorRetry";
import { useCheckStatus } from "../../utils/useCheckStatus";
import DetailMobile from "../(detail)/DetailMobile";
import DetailMobileMore from "../(detail)/DetailMobileMore";
import AmountExchange from "./AmountExchange";
import goBack from "../../utils/goBack";
import "./header.css";
import { useToastAndDialog } from "./hooks/useToastAndDialog";
import { useLang } from "./hooks/useLang";
import { useCountryInfo } from "./hooks/useCountryInfo";
import { getReferenceValue } from "./referenceUtil";
import { useRouter } from "next/navigation";
import ErrorBoundary from "@/app/checkout/ErrorBoundary";
import { removeStorage } from "@/lib/storage";
import { pick } from "lodash";
// 导入 Zustand 状态仓库
import {
  useCurrencyStore,
  useFormStore,
  useOrderStore,
  usePaymentMethodStore,
} from "@/store";
// 导入状态提供者上下文
import { useStore } from "@/store/StoreProvider";
import { useCurrencyInfo } from "@/app/checkout/hooks/useCurrencyInfo";

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

const FpCheckout: React.FC = () => {
  // 使用状态上下文
  const {
    isInitialized,
    isLoading: storeLoading,
    error: storeError,
  } = useStore();

  const selfRef = useRef<HTMLDivElement | null>(null);
  const [route, setRoute] = useSessionState<string>("route", undefined);
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  // 本地维护一个对话框状态，避免与store冲突
  const [showCurrencyExchangeDialog, setShowCurrencyExchangeDialog] =
    useState(false);
  const isMobile = isMobileScreen();
  const { push: navigate } = useRouter();

  // 从 Zustand 获取订单状态
  const { token, paymentOrderInfo, netError, setNetError } = useOrderStore();

  // 从 Zustand 获取支付方式状态
  const {
    currentPay,
    setCurrentPay,
    currentPayN,
    setCurrentPayN,
    paymentMethods,
    hasPaymentMethod,
    isLoaded: methodsLoaded,
  } = usePaymentMethodStore();

  // 从 Zustand 获取表单状态
  const {
    formValue,
    setFormValue,
    submitting,
    setSubmitting,
    redirecting,
    setRedirecting,
    handleFormSubmit,
  } = useFormStore();

  // 从 Zustand 获取货币状态
  const {
    currency,
    setCurrency,
    outAmount,
    isLoading: currencyLoading,
    fetchCurrencyExchange,
    exchangeMap,
  } = useCurrencyStore();

  // Memoize success navigation callback
  const goToSuccess = useCallback(async () => {
    const reference = getReferenceValue();
    navigate(`/success?reference=${reference}`);
  }, [navigate]);

  // 在货币或当前支付方式改变时，获取货币汇率信息
  useEffect(() => {
    if (currentPay && paymentOrderInfo && currency) {
      fetchCurrencyExchange(token, currentPay, paymentOrderInfo);
    }
  }, [currentPay, paymentOrderInfo, currency, token, fetchCurrencyExchange]);

  const supportedCountries = useMemo(
    () =>
      Array.from(
        new Set(
          paymentMethods
            .map((it) => it.supportedConsumer?.split(",") ?? [])
            .filter(Boolean)
            .flat(),
        ),
      ),
    [paymentMethods],
  );

  const { countries, country, setCountry } = useCountryInfo({
    supportedCountries,
    initialCountryCode: paymentOrderInfo?.countryCode,
  });

  const { showDetailMore, setShowDetailMore } = useToastAndDialog();

  const { lang, onChangeLang } = useLang();

  const { currencyInfo } = useCurrencyInfo(
    country,
    currentPay,
    currency,
    setCurrency,
  );
  // const currencyInfo = currentPay?.currencyInfo || [];

  const { validateResult, validateFieldList, resetValidate } =
    useValidateResult(currentPay?.regular, currentPay, token, {
      merchantId: paymentOrderInfo?.merchantId,
      appID: paymentOrderInfo?.productId,
    });

  const updateFormValue = React.useCallback(
    (newValue: FormValue, key: keyof FormValue) => {
      // 初始化时，并发渲染易丢失 callingCode
      setFormValue({
        ...pick(formValue, ...Object.keys(newValue)),
        ...newValue,
      });
      const keys = (key as string).split(",");
      validateFieldList(keys, newValue);
    },
    [formValue, setFormValue, validateFieldList],
  );

  const onClickPayBtn = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (e.currentTarget?.id === "pay-btn") {
        e.currentTarget?.closest("form")?.dispatchEvent(
          new Event("submit", {
            bubbles: true,
            cancelable: true,
          }),
        );
      }
    },
    [],
  );

  React.useEffect(() => {
    if (netError) {
      navigate(`/error?token=${token}&detail=${encodeURIComponent(netError)}`);
    }
  }, [netError, token, navigate]);

  const closeCountryOpen = useCallback(() => {
    setCountryOpen(false);
  }, []);
  const closeCurrencyOpen = useCallback(() => {
    setCurrencyOpen(false);
  }, []);
  const closeExchangeOpen = useCallback(() => {
    setShowCurrencyExchangeDialog(false);
  }, []);

  const n = useMemo(() => {
    const selectedIndex = paymentMethods
      .map((method, i) => (method.type === currentPay?.type ? i : undefined))
      .filter((it) => it !== undefined);
    const n1 = paymentMethods.findIndex(
      (method) => method.type === currentPay?.type,
    );
    return selectedIndex.length > 1 && selectedIndex.includes(currentPayN)
      ? currentPayN
      : n1;
  }, [paymentMethods, currentPay?.type, currentPayN]);

  const isKeyboardVisible = useKeyboardStatus();

  const currencyInfoSorted = currencyInfo || [];
  const running = useLoadingValue(outAmount, currencyLoading);
  const viewOutAmount = running === "-" ? outAmount : running;

  // 获取当前货币的汇率信息
  const currentCurrencyExchangeInfo = useMemo(
    () => (currency ? exchangeMap.get(currency) : undefined),
    [currency, exchangeMap],
  );

  useCheckStatus(
    token,
    true,
    useCallback(() => {
      setSubmitting(false);
      setRedirecting(false);
    }, [setRedirecting, setSubmitting]),
  );

  useEffect(() => {
    if (route === "home") {
      setSubmitting(false);
      setRedirecting(false);
    }
    window.addEventListener("popstate", () => {
      setSubmitting(false);
      setRedirecting(false);
      if (!window.location.hash) {
        removeStorage("route");
        window.location.reload();
      }
    });
  }, [route, setRedirecting, setSubmitting]);

  // 如果状态仓库正在加载或有错误
  if (storeLoading && !isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (storeError) {
    return <ErrorRetry detail={storeError} token={token} reference={""} />;
  }

  return (
    <ErrorBoundary>
      <div ref={selfRef} className="fp-checkout">
        <Suspense fallback={<LoadingSpinner />}>
          {isInitialized && methodsLoaded && hasPaymentMethod !== undefined ? (
            <StrictMode>
              <main className="h-full bg-white select-none" lang={lang}>
                <form
                  className={clsx(
                    "w-full min-h-full bg-gradient-to-r from-white to-silver",
                    { hidden: ["otp", "qrcode", "threeDS"].includes(route) },
                  )}
                  onSubmit={(e) =>
                    handleFormSubmit(e, {
                      token,
                      currentPay,
                      paymentOrderInfo: paymentOrderInfo!,
                      country,
                      currency,
                      outAmount,
                      validateFieldList,
                      navigate,
                      setNetError,
                      goToSuccess,
                    })
                  }
                >
                  <div
                    className={clsx(
                      "h-full flex flex-col sm:flex-row max-w-[1120px] mx-auto",
                      "[--px1:16px] xl:[--px1:80px]",
                      "[--px2:16px] xl:[--px2:80px]",
                      // route === 'home' ? '' : 'hidden'
                    )}
                  >
                    <DetailMobileMore
                      origin={paymentOrderInfo?.origin}
                      productName={paymentOrderInfo?.productName}
                      productDetail={paymentOrderInfo?.productDetail}
                      showDetailMore={showDetailMore}
                      setShowDetailMore={setShowDetailMore}
                    >
                      <Amount
                        orderAmount={paymentOrderInfo?.amount?.value}
                        inCurrency={paymentOrderInfo?.amount?.currency}
                      />
                    </DetailMobileMore>
                    <div className="w-full bg-white flex-1 sm:w-1/2 relative h-full">
                      {/** 🌏 Header 🌏 */}
                      <div className="px-(--px1) sticky z-50 top-0 flex items-center justify-between leading-[60px] h-[60px] cursor-pointer bg-white overflow-hidden">
                        <div
                          className={"flex-1 flex items-center space-x-2"}
                          onClick={() => goBack(paymentOrderInfo?.origin)}
                        >
                          <div
                            className={
                              showDetailMore
                                ? "slide-arrow-right"
                                : "slide-arrow-left"
                            }
                          >
                            <Arrow direction={"left"} />
                          </div>
                          <PayToIcon
                            className={clsx(
                              "text-white bg-black rounded-full size-[28px]",
                              showDetailMore
                                ? "slide-url-right"
                                : "slide-url-left",
                            )}
                          />
                          <div
                            className={clsx(
                              "flex-1 flex flex-col",
                              showDetailMore
                                ? "slide-url-right"
                                : "slide-url-left",
                            )}
                          >
                            <p
                              className={clsx(
                                "text-base/[1] font-bold empty:invisible",
                                "max-w-[calc(100vw-130px)] sm:max-w-[350px] overflow-hidden text-ellipsis whitespace-nowrap",
                              )}
                            >
                              {paymentOrderInfo?.origin}
                            </p>
                          </div>
                        </div>
                        <div
                          className={
                            "sm:hidden h-[60px] leading-[60px] flex items-center justify-end"
                          }
                          onClick={() =>
                            showDetailMore && setShowDetailMore(false)
                          }
                        >
                          <Arrow
                            direction={"up"}
                            className={clsx(
                              showDetailMore
                                ? "slide-arrow2-left"
                                : "slide-arrow2-right",
                              "w-12 -mr-10",
                            )}
                          />
                          <LangSwitch
                            lang={lang}
                            onChangeLang={onChangeLang}
                            className={clsx(
                              showDetailMore
                                ? "slide-lang-right"
                                : "slide-lang-left",
                            )}
                          />
                        </div>
                      </div>

                      {/** 🌏选择国家🌏 */}
                      <CountryLink
                        country={country}
                        openAreaDialog={() => setCountryOpen(true)}
                        className={clsx(
                          "sticky z-40 top-[60px] max-sm:border-t max-sm:border-[#CCCFD5]",
                          "px-(--px1) bg-white py-6",
                        )}
                        aria-controls="CountrySelectDialog"
                      />

                      <div className={"relative flex-base"}>
                        {/** 📱移动端📱 标题详情 */}
                        <DetailMobile
                          productName={paymentOrderInfo?.productName}
                          productDetail={paymentOrderInfo?.productDetail}
                          setShowDetailMore={setShowDetailMore}
                        >
                          <Amount
                            orderAmount={paymentOrderInfo?.amount?.value}
                            inCurrency={paymentOrderInfo?.amount?.currency}
                            className="[&_.total-amount>dt]:hidden [&_.total-amount>dd]:text-[28px] [&_.total-amount>dd]:h-[28px] [&_.total-amount]:mb-0"
                          />
                        </DetailMobile>

                        <div
                          className={clsx(
                            "px-(--px1) peer pb-10 -mt-3 sm:-mt-4",
                          )}
                        >
                          {paymentMethods.map((item, i) => (
                            <PayMethodCard
                              key={i}
                              checked={i === n}
                              index={i}
                              className={clsx(
                                "transition-all duration-300 ease-in-out transform",
                                "rounded-lg border-[1.5px] bg-[#F9FAFB] hover:border-[#1A1919] overflow-hidden",
                                i === n
                                  ? "!border-[#1A1919]"
                                  : "border-[#e5e7eb]",
                                paymentMethods.length === 1 ? "border-0" : "",
                              )}
                              item={item}
                              isInit={
                                i === 0 &&
                                (Number.isNaN(currentPayN) || currentPayN === i)
                              }
                              currentPay={currentPay}
                              onlyOne={paymentMethods.length === 1}
                              onCurrentPay={(
                                pay: PayMethod,
                                focus: boolean,
                                e,
                              ) => {
                                if (submitting || redirecting) {
                                  return;
                                }
                                if (isDebug())
                                  console.log("change current pay:", pay);
                                void reportEvent("payment_change", {
                                  paymentMethod: pay.type,
                                });
                                setCurrentPay(pay);
                                setCurrentPayN(i);
                                resetValidate();

                                if (focus) {
                                  onClickPayBtn(e);
                                }

                                if (country?.iso2Code === "any") {
                                  const country = countries?.find(
                                    (item) =>
                                      item.iso2Code ===
                                      (pay.supportedConsumer as string)
                                        ?.split(",")
                                        .shift(),
                                  );
                                  setCountry(country!);
                                }
                              }}
                            >
                              <div className={"px-6 pb-4"}>
                                {paymentOrderInfo?.isexchange &&
                                currencyInfo?.length &&
                                currencyInfo?.length > 1 ? (
                                  <div className="mt-6">
                                    <label className="block text-sm font-semibold">
                                      <Trans
                                        id={
                                          "payment.method.the_method_supports"
                                        }
                                        message="Select Payment Currency"
                                      />
                                    </label>
                                    <CurrencyInline
                                      key={currentPay?.platformName}
                                      currencyInfo={currencyInfo}
                                      value={currency}
                                      onValueChange={(value) =>
                                        setCurrency(value.detail)
                                      }
                                      onOpen={() => setCurrencyOpen(true)}
                                      disabled={submitting}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-4" />
                                )}
                                <CustomerForm
                                  className="mt-4"
                                  formValue={formValue}
                                  setFormValue={updateFormValue}
                                  validateResult={validateResult}
                                  countryCode={country?.iso2Code}
                                  countries={countries}
                                  currentPay={currentPay}
                                />
                                <PayBtn
                                  currencyLoading={currencyLoading}
                                  submitting={submitting}
                                  redirecting={redirecting}
                                  outAmount={viewOutAmount}
                                  currency={currency}
                                  googlePay={
                                    currentPay?.providerId === NMI &&
                                    currentPay?.type === "googlepayus"
                                  }
                                />
                                {paymentOrderInfo?.isexchange &&
                                currencyInfo?.length &&
                                currencyInfo?.length > 1 ? (
                                  <AmountExchange
                                    outAmount={viewOutAmount}
                                    orderAmount={
                                      paymentOrderInfo?.amount?.value
                                    }
                                    inCurrency={
                                      paymentOrderInfo?.amount?.currency
                                    }
                                    outCurrency={currency}
                                    currencyExchangeInfo={
                                      currentCurrencyExchangeInfo
                                    }
                                    currencyLoading={currencyLoading}
                                  />
                                ) : (
                                  <div className={"mt-4"} />
                                )}
                              </div>
                            </PayMethodCard>
                          ))}
                        </div>
                        {!paymentMethods?.length && (
                          <div
                            className={
                              "hidden peer-empty:block pt-10 px-6 sm:px-(--px1) pb-80"
                            }
                          >
                            <Trans id={"country.not_support"} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="max-sm:hidden w-1/2 shrink-0 overflow-hidden sm:h-full sticky top-0">
                      <div className="sm:bg-sliver relative h-full">
                        <section>
                          <div
                            className={
                              "px-(--px2) h-[60px] leading-[60px] flex justify-end max-sm:hidden"
                            }
                          >
                            <LangSwitch
                              lang={lang}
                              onChangeLang={onChangeLang}
                            />
                          </div>
                          <div
                            className={clsx("px-(--px2) py-6 sm:px-(--px2)")}
                          >
                            <div>
                              <div>
                                <div className="space-x-3 sm:items-center marker-none sm:flex-wrap align-top">
                                  <div className={clsx("space-y-6 w-full")}>
                                    <div className="flex items-center sm:space-x-4">
                                      <PayToIcon
                                        className={
                                          "max-sm:hidden text-white bg-black rounded-full flex-shrink-0"
                                        }
                                      />
                                      <div className={"flex flex-col w-full"}>
                                        <h2 className="text-sm/[1] font-light">
                                          <Trans
                                            id={"merchant.pay_to"}
                                            message="Payment to"
                                          />
                                        </h2>
                                        <p
                                          className={clsx(
                                            "text-base/[1] font-bold mt-2 empty:hidden",
                                            "w-[calc(100%-100px)] overflow-hidden text-ellipsis whitespace-nowrap",
                                          )}
                                          title={
                                            paymentOrderInfo?.origin as string
                                          }
                                        >
                                          {paymentOrderInfo?.origin}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {paymentOrderInfo?.productName &&
                                paymentOrderInfo?.productDetail ? (
                                  <>
                                    <div className="mt-6 bg-white p-6 max-sm:hidden break-words">
                                      <p className="font-semibold text-[18px]">
                                        {paymentOrderInfo?.productName}
                                      </p>
                                      <p className="text-[#1A1919] text-sm mt-4 break-words">
                                        {paymentOrderInfo?.productDetail}
                                      </p>
                                    </div>
                                    <Divider className={"mx-6"} />
                                  </>
                                ) : (
                                  <div className={"mt-6"} />
                                )}
                                <div className={"bg-white p-6"}>
                                  <Amount
                                    orderAmount={
                                      paymentOrderInfo?.amount?.value
                                    }
                                    inCurrency={
                                      paymentOrderInfo?.amount?.currency
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>

                  {/** 📱移动端📱 */}
                  <div
                    className={clsx(
                      "bg-silver",
                      route === "bank" ? "" : "hidden",
                      isKeyboardVisible ? "" : "min-h-full",
                    )}
                  >
                    <HeaderPhone
                      title={i18n.t("payment.payment.via.method", {
                        paymentMethod: currentPay?.platformName,
                      })}
                      onBack={() => setRoute("home")}
                    />
                    <div className={"px-6 pb-48"}>
                      {isMobile && (
                        <CustomerForm
                          className="mt-8"
                          formValue={formValue}
                          setFormValue={updateFormValue}
                          validateResult={validateResult}
                          countryCode={country?.iso2Code}
                          countries={countries}
                          currentPay={currentPay}
                        />
                      )}
                    </div>
                  </div>
                </form>
              </main>
            </StrictMode>
          ) : (
            <>
              <div className={"sr-only"} ref={selfRef}>
                Loading...
              </div>
              {methodsLoaded && (
                <ErrorRetry
                  detail={i18n.t({ id: "payment.network_error" })}
                  token={token}
                  reference={""}
                />
              )}
            </>
          )}
        </Suspense>
        <Dialog
          id={"CountrySelectDialog"}
          open={countryOpen}
          onClose={closeCountryOpen}
        >
          <CountrySelect
            lang={lang}
            value={country?.iso2Code}
            countries={countries}
            setValue={(value) => {
              setCountry(value);
              setCountryOpen(false);
            }}
          />
        </Dialog>
        <Dialog
          id={"CurrencyExchangeDialog"}
          open={showCurrencyExchangeDialog}
          onClose={closeExchangeOpen}
        >
          <CurrencyExchangeModal
            markup={currentPay?.markup || 0}
            currencyExchangeInfo={currentCurrencyExchangeInfo}
            inCurrency={paymentOrderInfo?.amount?.currency}
            outCurrency={currency}
            currencyLoading={currencyLoading}
          />
        </Dialog>
        <Dialog
          id={"CurrencySelectDialog"}
          open={currencyOpen}
          onClose={closeCurrencyOpen}
        >
          <CurrencySelect
            value={currency}
            setValue={(value) => {
              setCurrency(value);
              setCurrencyOpen(false);
            }}
            lang={lang}
            currencyInfo={currencyInfoSorted}
          />
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(FpCheckout);
