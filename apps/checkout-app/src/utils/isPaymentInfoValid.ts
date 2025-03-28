import { PaymentOrderInfo, PayMethod } from "../app/checkout/fp-checkout-type";
import { getAllFields } from "../app/(form)/validateNeedField";

function isPaymentInfoValid(
  paymentOrderInfo: PaymentOrderInfo | null,
  currentPay: PayMethod,
): boolean {
  if (!paymentOrderInfo || !paymentOrderInfo.paymentMethod) {
    return false; // Return false if paymentOrderInfo is null or paymentMethod is not present
  }

  const { holderName, firstName, lastName, shopperEmail } =
    paymentOrderInfo.paymentMethod;

  // Check if holderName or firstName and lastName are populated, and if shopperEmail has value
  const isHolderOrFullNameValid = !!holderName || (!!firstName && !!lastName);
  const isShopperEmailValid = !!shopperEmail;

  const regular = currentPay?.regular;
  const allFields = getAllFields(regular);
  return (
    isHolderOrFullNameValid && isShopperEmailValid && allFields.length === 0
  );
}

export default isPaymentInfoValid;
