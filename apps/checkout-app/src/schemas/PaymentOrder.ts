import { z } from "zod";
import { PaymentMethodFormSchema } from "./AllInOneForm";

export const PaymentOrderSchema = z
  .object({
    id: z.string().uuid().default("00000000-0000-0000-0000-000000000000"),
    countryCode: z.string().length(2).default("CN"),
    amountCurrency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default("CNY"),
    amountValue: z
      .number()
      .min(0)
      .max(10 ** 15)
      .default(0),
    productId: z.string().max(128).default("default_product"),
    merchantId: z.string().max(128).default("default_merchant"),
    origin: z.string().url().default("https://example.com"),
    productName: z.string().max(128).default("Default Product"),
    productDetail: z.string().max(256).default("Default Product Detail"),
    pspReference: z.string().nullable().optional(),
    reference: z.string().max(128).default("default_reference"),
    returnUrl: z.string().url().default("https://example.com/return"),
    isExchange: z.boolean().optional(),
    merchantAccount: z.string().nullable().optional(),
    webhookUrl: z.string().url().nullable().optional(),
    createdAt: z.date().default(() => new Date()),
    expiredAt: z
      .date()
      .default(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
    paymentMethodId: z.string().nullable().optional(),
    PaymentMethod: PaymentMethodFormSchema.optional(),
    version: z.number().int().default(1),
  })
  .strict();

export type PaymentOrder = z.infer<typeof PaymentOrderSchema>;

export const TokenInputSchema = z.object({
  token: z.string().uuid(),
});

export const PaymentOrderDebugSchema = z.object({
  amount: z
    .number()
    .int()
    .min(1)
    .default(100)
    .describe("支付金额（整数，实际金额乘以 100，例如 200 USD 传入 20000）"),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .default("USD")
    .describe("货币代码（3 个大写字母，例如 USD）"),
  holderName: z.string().default("").describe("持卡人姓名").optional(),
  shopperEmail: z.string().email().describe("购物者邮箱").optional(),
  paymentType: z
    .string()
    .default("")
    .describe("支付方式（例如 alipaycn）")
    .optional(),
  merchantId: z
    .string()
    .regex(/^[0-9]{1,19}$/)
    .default("1")
    .describe("商户 ID")
    .optional(),
});

export type PaymentOrderDebug = z.infer<typeof PaymentOrderDebugSchema>;

export const PaymentOrderOutputSchema = z.object({
  ...z.object(PaymentOrderSchema.shape).omit({
    id: true,
    isExchange: true,
    createdAt: true,
    amountValue: true,
    amountCurrency: true,
    paymentMethodId: true,
  }).shape,
  isexchange: z.boolean(),
  amount: z.object({
    currency: z.string(),
    value: z.number(),
  }),
});

export const PaymentOrderOutputSchemaFastify = z.object({
  ...PaymentOrderOutputSchema.omit({ expiredAt: true }).shape,
  expiredAt: z.string().datetime(),
});

export const CheckOutUrlSchema = z.object({
  checkOutUrl: z.string(),
});

export type TokenInput = z.infer<typeof TokenInputSchema>;
export type PaymentOrderOutput = z.infer<typeof PaymentOrderOutputSchema>;
export type CheckOutUrl = z.infer<typeof CheckOutUrlSchema>;
