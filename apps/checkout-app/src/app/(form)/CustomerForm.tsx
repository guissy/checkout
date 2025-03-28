"use client";

import React, { Fragment } from "react";
import { Input, InputError } from "checkout-ui";
import clsx from "clsx";
import { getAllFields, type ValidateResult } from "./validateNeedField";
import type {
  FormValue,
  PayMethod,
  RegularInfo,
  SchemaField,
} from "../checkout/fp-checkout-type";
import ExpiryDateInput, { ExpiryDateInputProps } from "./ExpiryDateInput";
import CardNumberInput from "./CardNumberInput";
import CallingCode from "./CallingCode";
import type { CountryInfo } from "../../api/fetchCountryInfoList";
import SupportedBank from "./SupportedBank";
import CountryInput from "./CountryInput";
import FirstNameInput from "./FirstNameInput";

// | `fullName`      | String         | 是   | 用户姓名     |
// | `customerPhone` | String         | 是   | 用户手机号   |
// | `customerEmail` | String         | 是   | 用户邮箱     |
// | `identity`      | Identification | 是   | 用户识别对象 |

type CustomFormerProps = {
  className?: string;
  formValue: FormValue;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  validateResult: ValidateResult;
  countryCode?: string;
  countries: CountryInfo[];
  currentPay: PayMethod | undefined;
  optRegular?: Record<string, RegularInfo>;
};

const CustomerForm: React.FC<CustomFormerProps> = ({
  countries,
  className,
  formValue,
  setFormValue,
  validateResult,
  countryCode,
  currentPay,
  optRegular,
}) => {
  const { supportedBankList } = currentPay || {};
  const regular = optRegular || currentPay?.regular;
  const allFields = getAllFields(regular);
  const cardFields = {} as {
    cardNumber: SchemaField;
    expiryYear: SchemaField;
    expiryMonth: SchemaField;
    cvv: SchemaField;
  };
  const groupedFields = allFields.reduce(
    (acc, field) => {
      let [row] = String(field?.position ?? "1")?.split("-") || ["1"];
      const cardNumberField = acc[Number(row) - 1]?.[0];
      if (cardNumberField?.key?.includes("bankAccountNumber")) {
        cardNumberField.isCard = true;
        field.isCard = true;
        row = String(Number(row) - 1);
        cardFields.cardNumber = cardNumberField;
      }
      if (field.key.includes("expiryMonth")) {
        cardFields.expiryMonth = field;
      }
      if (field.key.includes("expiryYear")) {
        cardFields.expiryYear = field;
      }
      if (field.key.includes("cvv") || field.key.includes("cvc")) {
        cardFields.cvv = field;
      }
      if (!acc[row]) acc[row] = [];
      acc[row].push(field);
      return acc;
    },
    {} as Record<string, SchemaField[]>,
  );
  const allFieldsSorted = Object.values(groupedFields).sort((a, b) =>
    a[0].position && b[0].position
      ? a[0].position.localeCompare(b[0].position)
      : 0,
  );
  const [focus, setFocus] = React.useState("");
  return (
    <div className={className}>
      {allFieldsSorted.map((items, j) =>
        items?.[0].isCard ? (
          <CardNumberInput
            key={"cardNumber"}
            formValue={formValue}
            setFormValue={setFormValue}
            validateResult={validateResult}
            cardFields={cardFields}
          />
        ) : (
          <div className={"flex w-full relative"} key={items[0].position}>
            {items.map(({ key, label, regular, format, icon, isCard }, i) => {
              if (key.endsWith("country"))
                return (
                  <CountryInput
                    key={key}
                    name={key}
                    value={
                      (formValue?.[key as keyof typeof formValue] as string) ??
                      ""
                    }
                    onValueChange={(value) => {
                      setFormValue(
                        { ...formValue, [key]: value } as FormValue,
                        key as keyof FormValue,
                      );
                    }}
                    label={label}
                    onFocus={() => setFocus(key)}
                    validateResult={validateResult}
                    formValue={formValue}
                    countryCode={countryCode}
                    setFormValue={setFormValue}
                  />
                );
              if (key.includes("telephoneNumber"))
                return (
                  <CallingCode
                    key={key}
                    name={key}
                    countries={countries}
                    countryCode={countryCode}
                    value={
                      (formValue?.[key as keyof typeof formValue] as string) ??
                      ""
                    }
                    onValueChange={(value) => {
                      setFormValue(
                        { ...formValue, [key]: value } as FormValue,
                        key as keyof FormValue,
                      );
                    }}
                    label={label}
                    onFocus={() => setFocus(key)}
                    validateResult={validateResult}
                    formValue={formValue}
                    setFormValue={setFormValue}
                  />
                );
              if (key.includes("bankName"))
                return (
                  <SupportedBank
                    key={key}
                    name={key}
                    value={
                      (formValue?.[key as keyof typeof formValue] as string) ??
                      ""
                    }
                    onValueChange={(value) => {
                      setFormValue(
                        { ...formValue, [key]: value } as FormValue,
                        key as keyof FormValue,
                      );
                    }}
                    label={label}
                    onFocus={() => setFocus(key)}
                    validateResult={validateResult}
                    formValue={formValue}
                    setFormValue={setFormValue}
                    supportedBankList={supportedBankList}
                  />
                );
              if (key.includes("firstName") || key.includes("lastName"))
                return key.includes("firstName") ? (
                  <FirstNameInput
                    key={key}
                    formValue={formValue}
                    setFormValue={setFormValue}
                    validateResult={validateResult}
                    classNameWrap={clsx(
                      focus === key && "z-30",
                      items.length > 1 && "-ml-px",
                    )}
                  />
                ) : (
                  <Fragment key={key}></Fragment>
                );
              if (key.includes("expiryMonth") || key.includes("expiryYear"))
                return key.includes("expiryMonth") ? (
                  <ExpiryDateInput
                    key={key}
                    formValue={formValue}
                    className={clsx(
                      "block w-full",
                      items.length > 1 && "[&_input]:rounded-none!",
                      items.length > 1 &&
                        i === 0 &&
                        "[&_input]:rounded-tl-md! [&_input]:rounded-bl-md!",
                      items.length > 1 &&
                        i === items.length - 1 &&
                        "[&_input]:rounded-tr-md! [&_input]:rounded-br-md!",
                    )}
                    setFormValue={setFormValue}
                    validateResult={validateResult}
                    label={isCard ? "" : label}
                    yearKey={cardFields.expiryYear?.key}
                    monthKey={cardFields.expiryMonth?.key}
                    isCard={false}
                    onFocus={() => setFocus(key)}
                    classNameWrap={clsx(
                      focus === key && "z-30",
                      items.length > 1 && "-ml-px",
                    )}
                    cardFields={{} as ExpiryDateInputProps["cardFields"]}
                  />
                ) : (
                  <Fragment key={key}></Fragment>
                );
              return (
                <div
                  key={key}
                  className={clsx(
                    "relative flex-1 has-focus:z-20",
                    focus === key && "z-30",
                    items.length > 1 && "-ml-px",
                  )}
                >
                  <Input
                    name={key}
                    className={clsx(
                      "block w-full",
                      items.length > 1 && "[&_input]:rounded-none!",
                      items.length > 1 &&
                        i === 0 &&
                        "[&_input]:rounded-tl-md! [&_input]:rounded-bl-md!",
                      items.length > 1 &&
                        i === items.length - 1 &&
                        "[&_input]:rounded-tr-md! [&_input]:rounded-br-md!",
                    )}
                    required={true}
                    invalid={
                      !!validateResult?.[key as keyof typeof validateResult]
                    }
                    label={isCard ? "" : label}
                    value={
                      (formValue?.[key as keyof typeof formValue] as string) ??
                      ""
                    }
                    onValueChange={(value) => {
                      setFormValue(
                        { ...formValue, [key]: value } as FormValue,
                        key as keyof FormValue,
                      );
                    }}
                    format={format}
                    pattern={regular}
                    onFocus={() => setFocus(key)}
                    autoFocus={i === 0 && j === 0}
                    autoComplete={
                      key.includes("fullName") ? "cc-name" : undefined
                    }
                    placeholder={"Please enter " + label}
                  />
                  {icon && (
                    <img
                      src={icon}
                      alt="visa"
                      className="h-6 w-auto absolute top-1 right-4"
                    />
                  )}
                  {isCard ? (
                    ""
                  ) : (
                    <InputError>
                      {validateResult?.[key as keyof typeof validateResult]}
                    </InputError>
                  )}
                </div>
              );
            })}
          </div>
        ),
      )}
    </div>
  );
};

export default CustomerForm;
