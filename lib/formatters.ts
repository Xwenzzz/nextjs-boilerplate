/**
 * 格式化大数字，将123450000格式化为"1.23亿"
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatLargeNumber(num: number | string): string {
  // 确保输入是数字
  const numValue = typeof num === "string" ? Number.parseFloat(num) : num

  if (isNaN(numValue)) return "0"

  if (numValue >= 100000000) {
    // 亿级别 - 保留1位小数
    const yi = numValue / 100000000
    return `${yi.toFixed(1)}亿`
  } else if (numValue >= 10000) {
    // 万级别 - 保留1位小数
    const wan = numValue / 10000
    return `${wan.toFixed(1)}万`
  } else {
    // 小于万的数字直接返回
    return numValue.toString()
  }
}

/**
 * 格式化货币，专门用于奖池金额等大额数字
 * @param value 要格式化的值
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number | string): string {
  if (typeof amount === "string") {
    const cleanedAmount = amount.replace(/[^\d.]/g, "")
    amount = Number.parseFloat(cleanedAmount)
  }
  if (isNaN(amount)) {
    return "N/A"
  }
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 格式化奖池金额，专门用于彩票奖池显示 - 最简洁版本
 * @param value 奖池金额
 * @returns 格式化后的奖池金额字符串
 */
export function formatJackpot(amount: number | string): string {
  if (typeof amount === "string") {
    const cleanedAmount = amount.replace(/[^\d.]/g, "")
    amount = Number.parseFloat(cleanedAmount)
  }
  if (isNaN(amount)) {
    return "N/A"
  }

  if (amount >= 100000000) {
    const yi = Math.floor(amount / 100000000)
    const wan = Math.floor((amount % 100000000) / 10000)
    return `${yi}亿${wan > 0 ? wan + "万" : ""}`
  } else if (amount >= 10000) {
    const wan = Math.floor(amount / 10000)
    return `${wan}万`
  } else {
    return formatCurrency(amount)
  }
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间）
 * @param decimals 小数位数，默认1位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return "0%"
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 格式化数字，添加千分位分隔符
 * @param value 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  if (isNaN(numValue)) return "0"

  return numValue.toLocaleString("zh-CN")
}

/**
 * 格式化奖金等级显示
 * @param value 奖金金额
 * @returns 格式化后的奖金字符串
 */
export function formatPrize(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "0元"

  let numValue: number
  if (typeof value === "string") {
    const cleanedValue = value.replace(/[^\d.]/g, "")
    numValue = Number.parseFloat(cleanedValue)
    if (isNaN(numValue)) return "0元"
  } else {
    numValue = value
  }

  if (numValue >= 10000000) {
    // 千万级别
    return `${(numValue / 10000000).toFixed(0)}千万元`
  } else if (numValue >= 1000000) {
    // 百万级别
    return `${(numValue / 1000000).toFixed(0)}百万元`
  } else if (numValue >= 10000) {
    // 万级别
    return `${(numValue / 10000).toFixed(0)}万元`
  } else {
    return `${numValue.toFixed(0)}元`
  }
}

/**
 * 格式化期号，例如将"2023001"格式化为"23001"
 * @param issueNo 原始期号字符串
 * @returns 格式化后的期号字符串
 */
export function formatIssueNo(issueNo: string | number): string {
  if (typeof issueNo === "number") {
    return String(issueNo).padStart(5, "0") // 假设期号是5位数字
  }
  if (typeof issueNo === "string") {
    return issueNo.padStart(5, "0")
  }
  return "N/A"
}
