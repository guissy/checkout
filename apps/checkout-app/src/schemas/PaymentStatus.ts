import { z } from "zod";
import { PaymentStatus as PaymentStatusPrisma } from "@prisma/client";

export { PaymentStatus } from "@prisma/client";

// 使用 zod 定义枚举 Schema
export const PaymentStatusSchema = z.nativeEnum(PaymentStatusPrisma, {
  description: "订单状态枚举",
  invalid_type_error: "必须是有效的支付状态",
});

export const ReferenceInputSchema = z.object({
  reference: z
    .string({
      required_error: "订单号是必需的",
      invalid_type_error: "订单号必须是字符串",
    })
    .min(10, "订单号长度至少为10个字符")
    .max(64, "订单号长度不能超过64个字符")
    .describe("订单号"),
});

export type ReferenceInput = z.infer<typeof ReferenceInputSchema>;
