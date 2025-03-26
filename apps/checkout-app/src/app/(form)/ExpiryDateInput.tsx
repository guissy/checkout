'use client';

import React from 'react';
import { Input, InputError } from 'checkout-ui';
import type { FormValue, SchemaField } from '../checkout/fp-checkout-type';
import type { ValidateResult } from './validateNeedField';
import clsx from 'clsx';
import formatByTemplate from '../../utils/formatByTemplate';

export type ExpiryDateInputProps = {
  className?: string;
  formValue: Record<string, string|undefined>;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  validateResult: ValidateResult;
  yearKey: string;
  monthKey: string;
  label?: string;
  isCard: boolean;
  onFocus: () => void;
  classNameWrap: string;
  cardFields: {
    cardNumber: SchemaField
    expiryYear: SchemaField
    expiryMonth: SchemaField
    cvv: SchemaField
  }
};

const ExpiryDateInput: React.FC<ExpiryDateInputProps> = ({
                                                           classNameWrap,
                                                           className,
                                                           formValue,
                                                           setFormValue,
                                                           validateResult,
                                                           yearKey,
                                                           monthKey,
                                                           label,
                                                           isCard,
                                                           onFocus,
                                                           cardFields,
                                                         }) => {
  const [value, setValue] = React.useState(formValue[monthKey] ?formValue[monthKey] + '/' + formValue[yearKey] : '');
  return (
    <div className={clsx("relative flex-1", classNameWrap)}>
      <Input
        name={'expiryDate'}
        className={className}
        required={true}
        invalid={
          !!validateResult?.[monthKey] ||
          !!validateResult?.[yearKey]
        }
        label={label}
        value={value}
        onFocus={onFocus}
        onValueChange={(value) => {
          const num = value.replace(/\D/g, '');
          const month = num.slice(0, 2);
          const year = num.slice(2);
          setFormValue({
              ...formValue,
              [monthKey]: month,
              [yearKey]: year
          } as FormValue,
            [cardFields.cardNumber.key, monthKey, yearKey].filter(Boolean).join(',')
          );
          setValue(value);
        }}
        placeholder="MM/YY"
        format={(value) => formatByTemplate(value, '** / **') }
        autoComplete="cc-exp"
      />
      {!isCard &&<InputError>
        {validateResult?.[monthKey] || validateResult?.[yearKey]}
      </InputError>}
    </div>
  );
};

export default ExpiryDateInput;
