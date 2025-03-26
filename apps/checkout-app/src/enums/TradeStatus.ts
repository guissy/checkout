export enum TradeStatus {
  Pending = "Pending",
  Success = "Success",
  Failed = "Failed",
  Cancelled = "Cancelled",
  Timeout = "Timeout",
  Declined = "Declined",
  Refunded = "Refunded",
  RefundFailed = "RefundFailed",
  RefundReversed = "RefundReversed",
  RefundDeclined = "RefundDeclined",
  Chargeback = "Chargeback",
  ChargebackReversed = "ChargebackReversed",
  Dispute = "Dispute",
}

// 定义翻译类型约束
type Translation<T extends string> = Record<T, string>;

export const TradeStatusCN: Translation<TradeStatus> = {
  [TradeStatus.Pending]: "tradeStatus.Pending",
  [TradeStatus.Success]: "tradeStatus.Success",
  [TradeStatus.Failed]: "tradeStatus.Failed",
  [TradeStatus.Cancelled]: "tradeStatus.Cancelled",
  [TradeStatus.Timeout]: "tradeStatus.Timeout",
  [TradeStatus.Declined]: "tradeStatus.Declined",
  [TradeStatus.Refunded]: "tradeStatus.Refunded",
  [TradeStatus.RefundFailed]: "tradeStatus.RefundFailed",
  [TradeStatus.RefundReversed]: "tradeStatus.RefundReversed",
  [TradeStatus.RefundDeclined]: "tradeStatus.RefundDeclined",
  [TradeStatus.Chargeback]: "tradeStatus.Chargeback",
  [TradeStatus.ChargebackReversed]: "tradeStatus.ChargebackReversed",
  [TradeStatus.Dispute]: "tradeStatus.Dispute",
};
