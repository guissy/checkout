'use client';

import React from 'react';
import { Input, InputError } from 'checkout-ui';
import type { FormValue } from '../checkout/fp-checkout-type.ts';
import type { ValidateResult } from './validateNeedField.ts';
import clsx from 'clsx';

type ExpiryDateInputProps = {
  formValue: Record<string, string | undefined>;
  setFormValue: (formValue: FormValue, key: keyof FormValue) => void;
  validateResult: ValidateResult;
  classNameWrap: string;
};

const FirstNameInput: React.FC<ExpiryDateInputProps> = ({
                                                          classNameWrap,
                                                          formValue,
                                                          setFormValue,
                                                          validateResult,
                                                        }) => {
  return (
    <div className={clsx(classNameWrap, 'flex space-x-6')}>
      <div className={clsx("relative flex-1")}>
        <Input name={'paymentMethod.firstName'}
               className={clsx('block w-full')}
               required={true}
               invalid={!!validateResult?.['paymentMethod.firstName']}
               label={"First Name"}
               value={formValue?.['paymentMethod.firstName']}
               onValueChange={(value) => {
                 setFormValue({
                   ...formValue,
                   ['paymentMethod.firstName']: value
                 } as unknown as FormValue, 'paymentMethod.firstName');
               }}
               autoFocus={true}
               autoComplete={"given-name"}
        />
        <InputError>
          {validateResult?.["paymentMethod.firstName"]}
        </InputError>
      </div>
      <div className={clsx("relative flex-1")}>
        <Input name={'paymentMethod.lastName'}
               className={clsx('block w-full')}
               required={true}
               invalid={!!validateResult?.['paymentMethod.lastName']}
               label={"Last Name"}
               value={formValue?.['paymentMethod.lastName']}
               onValueChange={(value) => {
                 setFormValue({
                   ...formValue,
                   ['paymentMethod.lastName']: value
                 } as unknown as FormValue, 'paymentMethod.lastName');
               }}
               autoFocus={false}
               autoComplete={"family-name"}
        />
        <InputError>
          {validateResult?.['paymentMethod.lastName']}
        </InputError>
      </div>
    </div>
  );
};

export default FirstNameInput;
