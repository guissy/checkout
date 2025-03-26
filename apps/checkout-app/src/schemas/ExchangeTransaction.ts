import { z } from "zod";
import { PaymentMethodValue } from "./PaymentMethod";

export const ExchangeTransactionInputSchema = z.object({
  token: z.string(),
  in: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .describe('源币种代码，例如 "USD"'),
  out: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .describe('目标币种代码，例如 "CNY"'),
  markup: z.number().min(0).max(1),
  paymentMethod: PaymentMethodValue,
});

export const ExchangeTransactionSchema = z
  .object({
    id: z.string().uuid().describe("唯一标识符 (UUID)"),
    token: z.string().uuid().describe("Token 值"),
    in: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .describe('源币种代码，例如 "USD"'),
    out: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .describe('目标币种代码，例如 "CNY"'),
    exRate: z.number().describe("当前汇率，例如 7.283803"),
    futurePayRate: z.number().describe("预付汇率，例如 7.356641"),
    createdAt: z.string().datetime().describe("创建时间"),
  })
  .strict();

// 使用 omit 方法创建输出 schema
export const ExchangeTransactionOutputSchema = ExchangeTransactionSchema.omit({
  id: true,
  token: true,
  createdAt: true,
});

export type ExchangeTransaction = z.infer<typeof ExchangeTransactionSchema>;
export type ExchangeTransactionInput = z.infer<
  typeof ExchangeTransactionInputSchema
>;
export type ExchangeTransactionOutput = z.infer<
  typeof ExchangeTransactionOutputSchema
>;
