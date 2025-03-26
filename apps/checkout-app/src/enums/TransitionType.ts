import { t } from "@lingui/core/macro";

export enum TransactionType {
  wallet = "wallet",
  bankTransfer = "bankTransfer",
  localCard = "localCard",
  cash = "cash",
  instalments = "instalments",
  buyNowPayLater = "buyNowPayLater",
  payNow = "payNow",
  payLater = "payLater",
  payOverTime = "payOverTime",
  cryptocurrency = "cryptocurrency",
  prepaidCard = "prepaidCard",
  directDebit = "directDebit",
  card = "card",
  RealTimePayments = "RealTimePayments",
  // recurring = 'recurring',
}

// 定义翻译类型约束
type Translation<T extends string> = Record<T, string>;

// 中文翻译
export const TransactionTypeCN: Translation<TransactionType> = {
  [TransactionType.wallet]: t`transaction.type.wallet`,
  [TransactionType.bankTransfer]: t`transaction.type.bankTransfer`,
  [TransactionType.localCard]: t`transaction.type.localCard`,
  [TransactionType.cash]: t`transaction.type.cash`,
  [TransactionType.instalments]: t`transaction.type.instalments`,
  [TransactionType.buyNowPayLater]: t`transaction.type.buyNowPayLater`,
  [TransactionType.payNow]: t`transaction.type.payNow`,
  [TransactionType.payLater]: t`transaction.type.payLater`,
  [TransactionType.payOverTime]: t`transaction.type.payOverTime`,
  [TransactionType.cryptocurrency]: t`transaction.type.cryptocurrency`,
  [TransactionType.prepaidCard]: t`transaction.type.prepaidCard`,
  [TransactionType.directDebit]: t`transaction.type.directDebit`,
  [TransactionType.card]: t`transaction.type.card`,
  [TransactionType.RealTimePayments]: t`transaction.type.card`,
};
