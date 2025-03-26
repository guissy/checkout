import { z } from "zod";
import { PaymentMethodValue } from "./PaymentMethod";
import { PaymentStatus } from "./PaymentStatus";

// 定义 'type' 字段的枚举类型，并添加描述
const ActionType = z
  .enum(["redirect", "pin", "avs", "sms", "qrcode"])
  .describe("支付操作类型，可选值：redirect、pin、avs、sms、qrcode");

// 定义 'action' 对象，并添加描述、默认值、校验
const ActionSchema = z
  .object({
    paymentMethodType: PaymentMethodValue,
    url: z.string().url().describe("支付页面 URL"),
    applinkUrl: z.string().url().optional().describe("应用程序跳转链接"),
    schemeUrl: z.string().url().optional().describe("Scheme URL"),
    payUrl: z.string().url().optional().describe("支付 URL"),
    method: z.string().describe("HTTP 方法，例如 GET, POST"),
    type: ActionType,
    qrCode: z.string().describe("支付二维码内容"),
    message: z.string().optional().describe("支付提示信息"),
    fields: z.array(z.string()).optional().describe("需要填写的支付字段列表"),
  })
  .describe("支付操作相关信息");

// 定义 'amount' 对象，并添加描述、默认值、校验
const AmountSchema = z
  .object({
    currency: z
      .string()
      .min(3)
      .max(3)
      .default("USD")
      .describe("货币类型，ISO 4217 三位字母代码"),
    value: z.number().min(0).describe("金额的最小单位值，例如分、厘"),
  })
  .describe("订单金额信息");

// 定义 'order' 对象，并添加描述、默认值、校验
const OrderSchema = z
  .object({
    account: z.string().describe("付款账户唯一标识"),
    amount: AmountSchema,
    accountName: z.string().describe("账户持有人姓名"),
    bank: z.string().describe("银行名称"),
    expiresAt: z.string().datetime().describe("订单过期时间（ISO 8601 格式）"),
    note: z.string().describe("订单备注信息"),
  })
  .describe("订单信息");

// 定义 'customer' 对象，并添加描述、默认值、校验
const CustomerSchema = z
  .object({
    id: z.string().describe("客户唯一 ID"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .describe("客户电话号码，符合 E.164 格式"),
    name: z.string().min(1).describe("客户姓名"),
    email: z.string().email().describe("客户电子邮件地址"),
    createdAt: z.string().datetime().describe("客户创建时间（ISO 8601 格式）"),
  })
  .describe("客户信息");

// 定义主 Schema，并添加描述、默认值、校验
export const AllInOneOutputSchema = z
  .object({
    action: ActionSchema.optional(),
    amount: AmountSchema.optional(),
    order: OrderSchema.optional(),
    customer: CustomerSchema.optional(),
    refusalReason: z
      .string()
      .describe("拒绝原因或错误信息，若交易失败则提供详细信息"),
    pspReference: z.string().describe("支付服务提供商的唯一交易参考号"),
    reference: z.string().optional().describe("商户的订单参考号"),
    resultCode: z.nativeEnum(PaymentStatus).describe("订单状态枚举"),
    // /checkout/paymentInfo
    merchantReference: z.string().optional().describe("商户的订单参考号"),
  })
  .describe("完整的 API 响应数据，包含支付操作、订单信息、客户信息等");

export type AllInOneOutput = z.infer<typeof AllInOneOutputSchema>;
