import { z } from "zod";
import { PaymentMethodFormSchema } from "./AllInOneForm";

// 定义 Amount 的 Schema
export const AmountSchema = z
  .object({
    currency: z
      .string()
      .min(3)
      .max(3)
      .default("USD")
      .describe("货币类型，ISO 4217 三位字母代码"),
    value: z
      .number()
      .min(0)
      .describe("订单金额，单位为最小货币单位，例如分、厘"),
  })
  .describe("订单金额信息");

// 定义 BrowserInfo 的 Schema
const BrowserInfoSchema = z
  .object({
    terminalType: z.string().describe("终端类型，例如 WEB, MOBILE").optional(),
  })
  .describe("浏览器终端信息");

// 定义主 Schema
export const PaymentInputSchema = z
  .object({
    amount: AmountSchema,
    countryCode: z
      .string()
      .min(2)
      .max(2)
      .default("CN")
      .describe("国家代码，符合 ISO 3166-1 Alpha-2 标准"),
    isExchange: z.boolean().default(false).describe("是否进行汇率转换"),
    merchantAccount: z.string().describe("商户账户名称"),
    merchantId: z.string().describe("商户 ID"),
    origin: z.string().describe("请求来源，例如 xyz.com"),
    paymentMethod: PaymentMethodFormSchema,
    productDetail: z.string().describe("产品详细描述信息"),
    productId: z.string().describe("产品 ID"),
    productName: z.string().describe("产品名称"),
    reference: z.string().describe("订单唯一参考号"),
    returnUrl: z.string().url().describe("支付完成后的回调 URL"),
    webhookUrl: z.string().url().describe("支付通知 Webhook URL"),
    browserInfo: BrowserInfoSchema.optional(),
    processingCurrency: z
      .string()
      .min(3)
      .max(3)
      .describe("支付处理货币，符合 ISO 4217 货币代码"),
  })
  .describe("支付请求数据结构");

export const PaymentHeaderSchema = z.object({
  providerId: z.string().describe("支付渠道 ID"),
  merchantId: z.string().describe("商户 ID"),
  appId: z.string().describe("应用 ID"),
});

// 生成 TypeScript 类型
export type PaymentInput = z.infer<typeof PaymentInputSchema>;
