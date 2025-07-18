import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化货币
export function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿元`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万元`
  } else {
    return `${value.toFixed(2)}元`
  }
}

// 格式化奖池金额
export function formatJackpot(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}亿元`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万元`
  } else {
    return `${value.toFixed(0)}元`
  }
}

// 计算彩票中奖概率
export function calculateLotteryOdds() {
  // 大乐透：前区35选5，后区12选2
  const frontOdds = combination(35, 5) // C(35,5)
  const backOdds = combination(12, 2) // C(12,2)
  const totalOdds = frontOdds * backOdds

  return {
    frontOdds,
    backOdds,
    totalOdds,
    probability: 1 / totalOdds,
  }
}

// 计算组合数 C(n,r)
function combination(n: number, r: number): number {
  if (r > n) return 0
  if (r === 0 || r === n) return 1

  let result = 1
  for (let i = 0; i < r; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}

// 分析预测结果
export function analyzePredictionResults(predictions: number[][], actualNumbers: number[]) {
  const actualFront = actualNumbers.slice(0, 5)
  const actualBack = actualNumbers.slice(5, 7)

  return predictions.map((prediction, index) => {
    const predFront = prediction.slice(0, 5)
    const predBack = prediction.slice(5, 7)

    const frontMatches = predFront.filter((num) => actualFront.includes(num)).length
    const backMatches = predBack.filter((num) => actualBack.includes(num)).length

    return {
      group: index + 1,
      prediction,
      frontMatches,
      backMatches,
      totalMatches: frontMatches + backMatches,
      matchedNumbers: [
        ...predFront.filter((num) => actualFront.includes(num)),
        ...predBack.filter((num) => actualBack.includes(num)),
      ],
    }
  })
}
