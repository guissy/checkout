// import enumI18n from '../../utils/enumI18n';
import { i18n } from '@lingui/core';
import type { CurrencyInfo } from '../(currency)/CurrencyInfo';
import type { PaymentOrderRes } from '../../api/fetchPaymentOrder';

export type SupportedBankInfo = { name: string, description: string, bankCode: string }
export const NMI = 158;
export const EasyLink = 240;
export type PayMethod = {
  platformName: string;
  type: string;
  checkoutKey?: string;
  providerId?: number;
  platformId?: number;
  iconUrl: string;
  cards?: Pick<PayMethod, 'type' | 'iconUrl'>[];
  note?: string;
  currencyInfo?: CurrencyInfo[];
  supportedConsumer?: string;
  supportedBankList?: SupportedBankInfo[];
  transactionType?: TransactionType;
  needFieldName?: string[];
  markup?: number;
  supportBank?: string;
  regular?: Record<string, RegularInfo>
}

export type RegularInfo = {
  regular: string;
  name: string;
  position: string;
  icon: string;
  template?: string;
  need?: "0" | '1';
  label?: string;
}

export type SchemaField = {
  key: string;
  label: string;
  required?: boolean;
  regular?: string;
  format?: (value: string) => string;
  minLength?: number;
  maxLength?: number;
  position?: string;
  icon?: string;
  isCard?: boolean;
}

export type PayMethodRaw = Omit<PayMethod, 'needFieldName' | 'regular'> & { processingCurrencies?: string;  regular: string }

export enum TransactionType {
  wallet = 'wallet', // 电子钱包
  bankTransfer = 'bankTransfer', // 银行转帐
  localCard = 'localCard', // 本地卡
  cash = 'cash', // 现金
  instalments = 'instalments', // 分期
  buyNowPayLater = 'buyNowPayLater', // 先买后付
  payNow = 'payNow', // 先买后付 x
  payLater = 'payLater', // 先买后付 x
  payOverTime = 'payOverTime', // 先买后付 x
  cryptocurrency = 'cryptocurrency', // 加密货币
  prepaidCard = 'prepaidCard', // 预付卡
  directDebit ='directDebit', // 定期付款
  card ='card', // 信用卡 x
  RealTimePayments = "RealTimePayments", // 实时支付 x
  // recurring ='recurring', // 定期付款
}

export const getLifeStagePhaseCN = () => ({
    [TransactionType.wallet]: i18n.t("transaction.type.wallet"),
    [TransactionType.bankTransfer]: i18n.t("transaction.type.bankTransfer"),
    [TransactionType.localCard]: i18n.t("transaction.type.localCard"),
    [TransactionType.cash]: i18n.t("transaction.type.cash"),
    [TransactionType.instalments]: i18n.t("transaction.type.instalments"),
    [TransactionType.buyNowPayLater]: i18n.t("transaction.type.buyNowPayLater"),
    [TransactionType.payNow]: i18n.t("transaction.type.payNow"),
    [TransactionType.payLater]: i18n.t("transaction.type.payLater"),
    [TransactionType.payOverTime]: i18n.t("transaction.type.payOverTime"),
    [TransactionType.cryptocurrency]: i18n.t("transaction.type.cryptocurrency"),
    [TransactionType.prepaidCard]: i18n.t("transaction.type.prepaidCard"),
    [TransactionType.directDebit]: i18n.t("transaction.type.directDebit"),
    [TransactionType.card]: i18n.t("transaction.type.card"),
    [TransactionType.RealTimePayments]: i18n.t("transaction.type.card"),
});

export interface PaymentOrderInfo {
  countryCode: string;
  amount: {
    currency: string;
    value: number;
  };
  paymentMethod: {
    type: string;
    holderName: string;
    firstName: string;
    lastName: string;
    shopperEmail: string;
  };
  productId: string;
  merchantId: string;
  origin: string;
  productName: string;
  productDetail: string;
  pspReference: string;
  reference: string;
  returnUrl: string;
  isexchange: boolean;
}

export interface PaymentOrderInfoNmi extends PaymentOrderInfo {
  paymentMethod: PaymentOrderInfo['paymentMethod'] & {
    openid?: string;
    bankAccountNumber: string;
    expiryMonth: string;
    expiryYear: string;
    shopperEmail: string;
    firstName: string;
    lastName: string;
    holderName: string;
    appId: string;
  }
}

export interface BankCardInfo {
  bankCode: string;
  accountNumber: string;
  cvv: string;
  mmyy: string;
}


export interface CustomerInfo {
  fullName: string,
  customerPhone: string,
  customerEmail: string,
  identity: string,
}

export interface FormValue extends BankCardInfo, CustomerInfo {
  [key: string]: string | undefined;
}


export enum TradeStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Timeout = 'Timeout',
  Declined = 'Declined',
  Refunded = 'Refunded',
  RefundFailed = 'RefundFailed',
  RefundReversed = 'RefundReversed',
  RefundDeclined = 'RefundDeclined',
  Chargeback = 'Chargeback',
  ChargebackReversed = 'ChargebackReversed',
  Dispute = 'Dispute'
}

// export const TradeStatus$ = enumI18n(
//   TradeStatus,
//   {
//     [TradeStatus.Pending]: i18n.t("tradeStatus.Pending"),
//     [TradeStatus.Success]: i18n.t("tradeStatus.Success"),
//     [TradeStatus.Failed]: i18n.t("tradeStatus.Failed"),
//     [TradeStatus.Cancelled]: i18n.t("tradeStatus.Cancelled"),
//     [TradeStatus.Timeout]: i18n.t("tradeStatus.Timeout"),
//     [TradeStatus.Declined]: i18n.t("tradeStatus.Declined"),
//     [TradeStatus.Refunded]: i18n.t("tradeStatus.Refunded"),
//     [TradeStatus.RefundFailed]: i18n.t("tradeStatus.RefundFailed"),
//     [TradeStatus.RefundReversed]: i18n.t("tradeStatus.RefundReversed"),
//     [TradeStatus.RefundDeclined]: i18n.t("tradeStatus.RefundDeclined"),
//     [TradeStatus.Chargeback]: i18n.t("tradeStatus.Chargeback"),
//     [TradeStatus.ChargebackReversed]: i18n.t("tradeStatus.ChargebackReversed"),
//     [TradeStatus.Dispute]: i18n.t("tradeStatus.Dispute"),
//   },
//   'TradeStatus',
// );

export type PayOrder = {
  reference: string;
  value: number;
  currency: string;
  exValue: number;
  exCurrency: string;
  payType: PayMethod['type'];
  payName: PayMethod['platformName']
  expiresAt: string;
}
