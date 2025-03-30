"use client";

import React from "react";
import type { ValidateResult } from "./validateNeedField";
import type { FormValue, SchemaField } from "../checkout/fp-checkout-type";
import { Input, InputError } from "checkout-ui";
import clsx from "clsx";
import ExpiryDateInput from "./ExpiryDateInput";
import Visa from "../(method)/svg32x22/Visa.svg";
import CVC from "./CVC.svg";
import Mastercard from "../(method)/svg32x22/Mastercard.svg";
import Image from "next/image";
import { useLingui } from "@lingui/react";

type Props = {
  formValue: Record<string, string | undefined>;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  validateResult: ValidateResult;
  cardFields: {
    cardNumber: SchemaField;
    expiryYear: SchemaField;
    expiryMonth: SchemaField;
    cvv: SchemaField;
  };
};
const CardNumberInput: React.FC<Props> = ({
  formValue,
  setFormValue,
  validateResult,
  cardFields,
}) => {
  const { i18n } = useLingui();
  const { key, format, regular } = cardFields.cardNumber;
  const { key: keyCvc, regular: regularCvc } = cardFields.cvv;
  const error =
    validateResult?.[key] ||
    validateResult?.[cardFields.expiryYear?.key] ||
    validateResult?.[cardFields.expiryMonth?.key] ||
    validateResult?.[keyCvc];
  const [focus, setFocus] = React.useState<
    "cardNumber" | "expiryDate" | "cvv" | ""
  >("");
  return (
    <div>
      <div
        className={clsx(
          "relative flex-1",
          "has-focus:z-20",
          focus === "cardNumber" && "z-30",
        )}
      >
        <Input
          name={key}
          className={clsx(
            "block w-full",
            "[&_input]:rounded-bl-none! [&_input]:rounded-br-none!",
            "[&_input]:-mb-px!",
          )}
          required={true}
          invalid={!!validateResult?.[key]}
          label={i18n.t({ id: "form.bank_card_info" })}
          value={formValue?.[key] ?? ""}
          onValueChange={(value) => {
            setFormValue({ ...formValue, [key]: value } as FormValue, key);
          }}
          format={format}
          pattern={regular}
          minLength={16}
          maxLength={regular ? undefined : 19}
          onFocus={() => setFocus("cardNumber")}
          autoComplete="cc-number"
        />
        <Image
          className="absolute bottom-[7.5px] right-14 rounded w-8 *:w-8"
          src={Visa}
          alt="Visa"
        />
        <Image
          className="absolute bottom-[7.5px] right-4 rounded w-8 *:w-8"
          src={Mastercard}
          alt="Mastercard"
        />
      </div>
      <div
        className={clsx(
          "flex w-full",
          "has-focus:z-20",
          (focus === "expiryDate" || focus === "cvv") && "z-30",
        )}
      >
        {cardFields.expiryYear && (
          <ExpiryDateInput
            formValue={formValue}
            classNameWrap={focus === "expiryDate" ? "z-30" : ""}
            className={clsx(
              "block w-full",
              "[&_input]:rounded-tl-none!",
              cardFields.cvv && "[&_input]:rounded-tr-none!",
              cardFields.cvv && "[&_input]:rounded-br-none!",
            )}
            setFormValue={setFormValue}
            validateResult={validateResult}
            yearKey={cardFields.expiryYear?.key}
            monthKey={cardFields.expiryMonth?.key}
            isCard={true}
            onFocus={() => setFocus("expiryDate")}
            cardFields={cardFields}
          />
        )}
        {cardFields.cvv && (
          <div
            className={clsx(
              "relative flex-1 -ml-px",
              "has-focus:z-10",
              focus === "cvv" && "z-30",
            )}
          >
            <Input
              name={keyCvc}
              className={clsx(
                "block w-full",
                "[&_input]:rounded-tr-none!",
                cardFields.expiryYear && "[&_input]:rounded-tl-none!",
                cardFields.expiryYear && "[&_input]:rounded-bl-none!",
              )}
              required={true}
              invalid={!!validateResult?.[keyCvc]}
              value={formValue?.[keyCvc] ?? ""}
              onValueChange={(value) => {
                setFormValue(
                  { ...formValue, [keyCvc]: value } as FormValue,
                  [
                    cardFields.cardNumber.key,
                    cardFields.expiryYear?.key,
                    cardFields.expiryMonth?.key,
                    keyCvc,
                  ]
                    .filter(Boolean)
                    .join(","),
                );
              }}
              format={format}
              pattern={regularCvc}
              minLength={3}
              maxLength={4}
              placeholder={"CVV/CVC"}
              onFocus={() => setFocus("cvv")}
              autoComplete="cc-cvc"
            />
            <Image
              className="absolute bottom-[7.5px] right-4 rounded w-8 *:w-8"
              src={CVC}
              alt="CVC"
            />
          </div>
        )}
      </div>
      <InputError>{error}</InputError>
    </div>
  );
};

export default CardNumberInput;
