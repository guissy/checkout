export const currencyInteger = [
  "JPY","KRW","CLP","VND"
]

/**
 * 截取数字到指定的小数位数
 * @param {number} num - 要处理的数字
 * @param {number} decimalPlaces - 指定的小数位数
 * @returns {number} - 截取后的数字
 */
export const truncateNumber = (num: number | unknown, decimalPlaces: number | unknown) => {
  if (typeof num !== 'number' || typeof decimalPlaces !== 'number') {
    throw new Error('参数必须是数字类型');
  }
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
}

export const truncateCurrency = (num: number, currency: string) => {
  const decimalPlaces = currencyInteger.includes(currency) ? 0 : 2;
  const value = truncateNumber(num, decimalPlaces);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
