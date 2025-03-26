import { z } from "zod";
import PaymentMethodValueArr from "./PaymentMethodValueArr";

export const PaymentMethodValue = z.enum(PaymentMethodValueArr);

export const PaymentMethodFormSchema = z.object({
  type: PaymentMethodValue,
  holderName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  shopperEmail: z.string().email().optional(),
});

export const CurrencyInfoSchema = z.object({
  id: z.number().default(0).describe("自动增长的主键"),
  currencyNameEn: z.string().min(1).default("").describe("货币的英文名称"),
  currencyName: z.string().min(1).default("").describe("货币的本地名称"),
  currencyCode: z
    .string()
    .min(1)
    .default("")
    .describe("ISO 货币代码，例如 USD"),
  paymentMethodId: z.number().min(1).describe("关联 PaymentMethod 的主键"),
});

export const PaymentMethodSchema = z
  .object({
    id: z.number().default(0).describe("自动增长的主键"),
    productId: z.number().min(1).describe("产品ID"),
    platformId: z.number().min(1).describe("平台ID"),
    type: z.string().min(1).describe("支付方式类型"),
    transactionType: z
      .string()
      .min(1)
      .describe("交易类型，例如 wallet、card、bankTransfer 等"),
    imageLink: z.string().min(1).describe("图片链接或资源路径"),
    acquiringMode: z
      .string()
      .min(1)
      .describe("收单模式，如 direct、link、checkout 等"),
    processingCurrencies: z
      .string()
      .min(1)
      .describe("处理币种，多个币种以逗号分隔"),
    productChannelId: z.number().min(1).describe("产品渠道ID"),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    merchantId: z.bigint().min(1).describe("商户ID"),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    providerId: z.bigint().min(1).describe("服务提供商ID"),
    platformName: z.string().min(1).describe("平台名称"),
    channelId: z.number().min(1).describe("渠道ID"),
    markup: z.number().min(0).describe("加价比例（浮点数）"),
    needField: z.string().default("{}").describe("保存必要字段的 JSON 字符串"),
    regular: z.string().default("{}").describe("保存常规字段的 JSON 字符串"),
    supportedConsumer: z
      .string()
      .default("")
      .describe("支持的消费者国家代码，多个以逗号分隔"),
    currencyInfo: z.array(CurrencyInfoSchema).describe("关联的币种信息数组"),
  })
  .describe("支付方法详细信息");

export const PaymentMethodListSchema = z.array(PaymentMethodSchema);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CurrencyInfo = z.infer<typeof CurrencyInfoSchema>;
