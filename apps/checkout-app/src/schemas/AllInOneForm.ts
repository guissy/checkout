import { z } from 'zod';

// 基础字段的定义
const baseFields = {
  holderName: z.string().min(1, { message: "持卡人姓名不能为空" }),
  shopperEmail: z.string().email({ message: "请输入有效的邮箱地址" }),
  telephoneNumber: z.string().min(1, { message: "电话号码不能为空" }),
  firstName: z.string().min(1, { message: "名字不能为空" }),
  lastName: z.string().min(1, { message: "姓氏不能为空" }),
  country: z.string().min(1, { message: "国家不能为空" }),
  bankAccountNumber: z.string().min(1, { message: "银行账号不能为空" }),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: "请输入有效的到期月份 (01-12)" }),
  expiryYear: z.string().regex(/^\d{2}$/, { message: "请输入有效的到期年份 (2位数字)" })
  .refine((value) => {
    const currentYear = new Date().getFullYear();
    const maxYear = (currentYear + 10) - 2000;
    return parseInt(value) <= maxYear;
  }, { message: "最晚不能超过10年" }),
  cvc: z.string().regex(/^\d{3,4}$/, { message: "请输入有效的安全码 (3-4位数字)" })
};

// 为每种支付方式创建特定的验证模式
const paymentMethodSchemas = {
  // 仅需持卡人姓名和邮箱的支付方式
  bpi: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  gcash: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  alipaycn: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  billease: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  alipayhk: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  boost: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  dana: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  rabbitlinepay: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  kplus: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  kredivo: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  mpay: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  naverpay: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  tinaba: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  tmn: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  tng: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  tsp: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  kakaopay: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
  }),
  
  // 需要持卡人姓名、邮箱和电话号码的支付方式
  wemabank: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  konbini: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  koreancard: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  mobilemoney: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  mpesa: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  onlinebanking: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
  }),
  
  // 需要更多字段的支付方式
  cardafrica: z.object({
    holderName: baseFields.holderName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
    bankAccountNumber: baseFields.bankAccountNumber,
    expiryMonth: baseFields.expiryMonth,
    expiryYear: baseFields.expiryYear,
    cvc: baseFields.cvc,
  }),
  
  creditcardupop: z.object({
    firstName: baseFields.firstName,
    lastName: baseFields.lastName,
    shopperEmail: baseFields.shopperEmail,
    telephoneNumber: baseFields.telephoneNumber,
    country: baseFields.country,
    bankAccountNumber: baseFields.bankAccountNumber,
    expiryMonth: baseFields.expiryMonth,
    expiryYear: baseFields.expiryYear,
    cvc: baseFields.cvc,
  }),
};

// 创建一个通用的支付方式验证工厂函数
export const createPaymentValidator = (paymentMethod: keyof typeof paymentMethodSchemas) => {
  return paymentMethodSchemas[paymentMethod];
};

// 示例：如何使用此验证工厂
// const alipayValidator = createPaymentValidator('alipaycn');
// const validationResult = alipayValidator.safeParse(formData);

// 也可以创建一个包含所有支付方式的联合类型
export const PaymentMethodFormSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bpi'), ...paymentMethodSchemas.bpi.shape }),
  z.object({ type: z.literal('gcash'), ...paymentMethodSchemas.gcash.shape }),
  z.object({ type: z.literal('alipaycn'), ...paymentMethodSchemas.alipaycn.shape }),
  z.object({ type: z.literal('billease'), ...paymentMethodSchemas.billease.shape }),
  z.object({ type: z.literal('alipayhk'), ...paymentMethodSchemas.alipayhk.shape }),
  z.object({ type: z.literal('boost'), ...paymentMethodSchemas.boost.shape }),
  z.object({ type: z.literal('wemabank'), ...paymentMethodSchemas.wemabank.shape }),
  z.object({ type: z.literal('konbini'), ...paymentMethodSchemas.konbini.shape }),
  z.object({ type: z.literal('cardafrica'), ...paymentMethodSchemas.cardafrica.shape }),
  z.object({ type: z.literal('creditcardupop'), ...paymentMethodSchemas.creditcardupop.shape }),
  z.object({ type: z.literal('dana'), ...paymentMethodSchemas.dana.shape }),
  z.object({ type: z.literal('rabbitlinepay'), ...paymentMethodSchemas.rabbitlinepay.shape }),
  z.object({ type: z.literal('koreancard'), ...paymentMethodSchemas.koreancard.shape }),
  z.object({ type: z.literal('kplus'), ...paymentMethodSchemas.kplus.shape }),
  z.object({ type: z.literal('kredivo'), ...paymentMethodSchemas.kredivo.shape }),
  z.object({ type: z.literal('mobilemoney'), ...paymentMethodSchemas.mobilemoney.shape }),
  z.object({ type: z.literal('mpay'), ...paymentMethodSchemas.mpay.shape }),
  z.object({ type: z.literal('mpesa'), ...paymentMethodSchemas.mpesa.shape }),
  z.object({ type: z.literal('naverpay'), ...paymentMethodSchemas.naverpay.shape }),
  z.object({ type: z.literal('onlinebanking'), ...paymentMethodSchemas.onlinebanking.shape }),
  z.object({ type: z.literal('tinaba'), ...paymentMethodSchemas.tinaba.shape }),
  z.object({ type: z.literal('tmn'), ...paymentMethodSchemas.tmn.shape }),
  z.object({ type: z.literal('tng'), ...paymentMethodSchemas.tng.shape }),
  z.object({ type: z.literal('tsp'), ...paymentMethodSchemas.tsp.shape }),
  z.object({ type: z.literal('kakaopay'), ...paymentMethodSchemas.kakaopay.shape }),
]);

