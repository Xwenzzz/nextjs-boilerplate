import type { LotteryDraw } from "@/types/lottery"

// 号码频率分析结果
export interface NumberFrequency {
  number: number
  frequency: number
  percentage: number
  isHot: boolean
  isCold: boolean
  lastAppeared: number
}

// 奇偶比例分析结果
export interface OddEvenRatio {
  oddCount: number
  evenCount: number
  oddPercentage: number
  evenPercentage: number
}

// 大小比例分析结果
export interface BigSmallRatio {
  bigCount: number
  smallCount: number
  bigPercentage: number
  smallPercentage: number
}

// 和值分布分析结果
export interface SumDistribution {
  avg: number
  min: number
  max: number
  distribution: { [key: number]: number }
}

// 跨度分布分析结果
export interface SpanDistribution {
  avg: number
  min: number
  max: number
  distribution: { [key: number]: number }
}

// 号码组合评估结果
export interface CombinationEvaluation {
  score: number
  analysis: {
    frequencyScore: number
    balanceScore: number
    trendScore: number
    diversityScore: number
    details: string
    overallRating: string
  }
}

/**
 * 安全地处理数组，确保不为null或undefined
 */
function safeArray<T>(arr: T[] | null | undefined): T[] {
  if (Array.isArray(arr)) {
    return arr
  }
  return []
}

/**
 * 安全地处理对象，确保不为null或undefined
 */
function safeObject<T extends Record<string, any>>(obj: T | null | undefined): T {
  if (obj && typeof obj === "object") {
    return obj
  }
  return {} as T
}

/**
 * 分析号码出现频率
 */
export function analyzeNumberFrequency(data: LotteryDraw[], isFront: boolean): NumberFrequency[] {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) return []

    const maxNumber = isFront ? 35 : 12
    const frequencies: { [key: number]: { count: number; lastIndex: number } } = {}

    // 初始化频率统计
    for (let i = 1; i <= maxNumber; i++) {
      frequencies[i] = { count: 0, lastIndex: -1 }
    }

    // 统计每个号码的出现次数和最后出现位置
    safeData.forEach((draw, index) => {
      if (!draw) return

      const numbers = isFront ? safeArray(draw.frontNumbers) : safeArray(draw.backNumbers)
      numbers.forEach((num) => {
        if (typeof num === "number" && num >= 1 && num <= maxNumber) {
          frequencies[num].count++
          frequencies[num].lastIndex = index
        }
      })
    })

    // 计算平均频率
    let totalCount = 0
    for (let i = 1; i <= maxNumber; i++) {
      totalCount += frequencies[i].count
    }
    const avgFrequency = totalCount / maxNumber

    // 生成结果
    const results: NumberFrequency[] = []
    for (let i = 1; i <= maxNumber; i++) {
      const freq = frequencies[i]
      const percentage = safeData.length > 0 ? freq.count / safeData.length : 0
      const isHot = freq.count > avgFrequency * 1.2
      const isCold = freq.count < avgFrequency * 0.8
      const lastAppeared = freq.lastIndex >= 0 ? freq.lastIndex : safeData.length

      results.push({
        number: i,
        frequency: freq.count,
        percentage,
        isHot,
        isCold,
        lastAppeared,
      })
    }

    return results.sort((a, b) => b.frequency - a.frequency)
  } catch (error) {
    console.error("分析号码频率时出错:", error)
    return []
  }
}

/**
 * 分析奇偶比例
 */
export function analyzeOddEvenRatio(data: LotteryDraw[], isFront: boolean): OddEvenRatio {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) {
      return { oddCount: 0, evenCount: 0, oddPercentage: 0.5, evenPercentage: 0.5 }
    }

    let oddCount = 0
    let evenCount = 0

    safeData.forEach((draw) => {
      if (!draw) return

      const numbers = isFront ? safeArray(draw.frontNumbers) : safeArray(draw.backNumbers)
      numbers.forEach((num) => {
        if (typeof num === "number") {
          if (num % 2 === 1) {
            oddCount++
          } else {
            evenCount++
          }
        }
      })
    })

    const total = oddCount + evenCount
    const oddPercentage = total > 0 ? oddCount / total : 0.5
    const evenPercentage = total > 0 ? evenCount / total : 0.5

    return {
      oddCount,
      evenCount,
      oddPercentage,
      evenPercentage,
    }
  } catch (error) {
    console.error("分析奇偶比例时出错:", error)
    return { oddCount: 0, evenCount: 0, oddPercentage: 0.5, evenPercentage: 0.5 }
  }
}

/**
 * 分析大小比例
 */
export function analyzeBigSmallRatio(data: LotteryDraw[], isFront: boolean): BigSmallRatio {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) {
      return { bigCount: 0, smallCount: 0, bigPercentage: 0.5, smallPercentage: 0.5 }
    }

    const threshold = isFront ? 18 : 6
    let bigCount = 0
    let smallCount = 0

    safeData.forEach((draw) => {
      if (!draw) return

      const numbers = isFront ? safeArray(draw.frontNumbers) : safeArray(draw.backNumbers)
      numbers.forEach((num) => {
        if (typeof num === "number") {
          if (num > threshold) {
            bigCount++
          } else {
            smallCount++
          }
        }
      })
    })

    const total = bigCount + smallCount
    const bigPercentage = total > 0 ? bigCount / total : 0.5
    const smallPercentage = total > 0 ? smallCount / total : 0.5

    return {
      bigCount,
      smallCount,
      bigPercentage,
      smallPercentage,
    }
  } catch (error) {
    console.error("分析大小比例时出错:", error)
    return { bigCount: 0, smallCount: 0, bigPercentage: 0.5, smallPercentage: 0.5 }
  }
}

/**
 * 分析和值分布
 */
export function analyzeSumDistribution(data: LotteryDraw[]): SumDistribution {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) {
      return { avg: 100, min: 15, max: 175, distribution: {} }
    }

    const sums: number[] = []
    const distribution: { [key: number]: number } = {}

    safeData.forEach((draw) => {
      if (!draw) return

      const frontNumbers = safeArray(draw.frontNumbers)
      if (frontNumbers.length === 5) {
        const sum = frontNumbers.reduce((acc, num) => {
          return acc + (typeof num === "number" ? num : 0)
        }, 0)

        if (sum > 0) {
          sums.push(sum)
          distribution[sum] = (distribution[sum] || 0) + 1
        }
      }
    })

    if (sums.length === 0) {
      return { avg: 100, min: 15, max: 175, distribution: {} }
    }

    const avg = sums.reduce((acc, sum) => acc + sum, 0) / sums.length
    const min = Math.min(...sums)
    const max = Math.max(...sums)

    return { avg, min, max, distribution }
  } catch (error) {
    console.error("分析和值分布时出错:", error)
    return { avg: 100, min: 15, max: 175, distribution: {} }
  }
}

/**
 * 分析跨度分布
 */
export function analyzeSpanDistribution(data: LotteryDraw[]): SpanDistribution {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) {
      return { avg: 20, min: 4, max: 34, distribution: {} }
    }

    const spans: number[] = []
    const distribution: { [key: number]: number } = {}

    safeData.forEach((draw) => {
      if (!draw) return

      const frontNumbers = safeArray(draw.frontNumbers)
      if (frontNumbers.length === 5) {
        const validNumbers = frontNumbers.filter((num) => typeof num === "number")
        if (validNumbers.length === 5) {
          const span = Math.max(...validNumbers) - Math.min(...validNumbers)
          spans.push(span)
          distribution[span] = (distribution[span] || 0) + 1
        }
      }
    })

    if (spans.length === 0) {
      return { avg: 20, min: 4, max: 34, distribution: {} }
    }

    const avg = spans.reduce((acc, span) => acc + span, 0) / spans.length
    const min = Math.min(...spans)
    const max = Math.max(...spans)

    return { avg, min, max, distribution }
  } catch (error) {
    console.error("分析跨度分布时出错:", error)
    return { avg: 20, min: 4, max: 34, distribution: {} }
  }
}

/**
 * 生成智能号码
 */
export function generateSmartNumbers(
  data: LotteryDraw[],
  strategy: string,
  count: number,
  maxNumber: number,
  isFront: boolean,
): number[] {
  try {
    const safeData = safeArray(data)
    if (safeData.length === 0) {
      return generateRandomNumbers(count, maxNumber)
    }

    const frequencies = analyzeNumberFrequency(safeData, isFront)
    let candidates: number[] = []

    switch (strategy) {
      case "hot":
        candidates = frequencies
          .filter((f) => f.isHot)
          .map((f) => f.number)
          .slice(0, Math.min(count + 2, maxNumber))
        break

      case "cold":
        candidates = frequencies
          .filter((f) => f.isCold)
          .map((f) => f.number)
          .slice(0, Math.min(count + 2, maxNumber))
        break

      case "balanced":
        const hotNumbers = frequencies.filter((f) => f.isHot).map((f) => f.number)
        const coldNumbers = frequencies.filter((f) => f.isCold).map((f) => f.number)
        candidates = [...hotNumbers.slice(0, Math.ceil(count / 2)), ...coldNumbers.slice(0, Math.ceil(count / 2))]
        break

      case "trend":
        const recentData = safeData.slice(0, Math.min(10, safeData.length))
        const recentFreq = analyzeNumberFrequency(recentData, isFront)
        candidates = recentFreq
          .sort((a, b) => b.frequency - a.frequency)
          .map((f) => f.number)
          .slice(0, count + 2)
        break

      case "integrated":
      default:
        const hotCount = Math.ceil(count * 0.4)
        const coldCount = Math.ceil(count * 0.3)
        const normalCount = count - hotCount - coldCount

        const hotNums = frequencies
          .filter((f) => f.isHot)
          .map((f) => f.number)
          .slice(0, hotCount)
        const coldNums = frequencies
          .filter((f) => f.isCold)
          .map((f) => f.number)
          .slice(0, coldCount)
        const normalNums = frequencies
          .filter((f) => !f.isHot && !f.isCold)
          .map((f) => f.number)
          .slice(0, normalCount)

        candidates = [...hotNums, ...coldNums, ...normalNums]
        break
    }

    // 如果候选号码不够，补充随机号码
    if (candidates.length < count) {
      const existing = new Set(candidates)
      for (let i = 1; i <= maxNumber && candidates.length < count; i++) {
        if (!existing.has(i)) {
          candidates.push(i)
        }
      }
    }

    // 随机选择并排序
    const selected = candidates
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .sort((a, b) => a - b)

    return selected.length === count ? selected : generateRandomNumbers(count, maxNumber)
  } catch (error) {
    console.error("生成智能号码时出错:", error)
    return generateRandomNumbers(count, maxNumber)
  }
}

/**
 * 生成随机号码
 */
function generateRandomNumbers(count: number, maxNumber: number): number[] {
  const numbers: number[] = []
  const used = new Set<number>()

  while (numbers.length < count) {
    const num = Math.floor(Math.random() * maxNumber) + 1
    if (!used.has(num)) {
      used.add(num)
      numbers.push(num)
    }
  }

  return numbers.sort((a, b) => a - b)
}

/**
 * 评估号码组合质量
 */
export function evaluateNumberCombination(
  numbers: number[],
  data: LotteryDraw[],
  isFront: boolean,
): CombinationEvaluation {
  try {
    const safeNumbers = safeArray(numbers)
    const safeData = safeArray(data)

    if (safeNumbers.length === 0) {
      return {
        score: 0,
        analysis: {
          frequencyScore: 0,
          balanceScore: 0,
          trendScore: 0,
          diversityScore: 0,
          details: "无效的号码组合",
          overallRating: "无效",
        },
      }
    }

    const frequencies = analyzeNumberFrequency(safeData, isFront)
    const oddEven = analyzeOddEvenRatio(safeData, isFront)
    const bigSmall = analyzeBigSmallRatio(safeData, isFront)

    // 频率分析评分
    let frequencyScore = 0
    const avgFreq = frequencies.reduce((sum, f) => sum + f.frequency, 0) / frequencies.length
    safeNumbers.forEach((num) => {
      const freq = frequencies.find((f) => f.number === num)
      if (freq) {
        const ratio = freq.frequency / avgFreq
        frequencyScore += Math.min(100, ratio * 50)
      }
    })
    frequencyScore = frequencyScore / safeNumbers.length

    // 平衡性评分
    const oddCount = safeNumbers.filter((n) => n % 2 === 1).length
    const evenCount = safeNumbers.length - oddCount
    const oddRatio = oddCount / safeNumbers.length
    const expectedOddRatio = oddEven.oddPercentage
    const oddBalance = 1 - Math.abs(oddRatio - expectedOddRatio)

    const threshold = isFront ? 18 : 6
    const bigCount = safeNumbers.filter((n) => n > threshold).length
    const smallCount = safeNumbers.length - bigCount
    const bigRatio = bigCount / safeNumbers.length
    const expectedBigRatio = bigSmall.bigPercentage
    const bigBalance = 1 - Math.abs(bigRatio - expectedBigRatio)

    const balanceScore = ((oddBalance + bigBalance) / 2) * 100

    // 趋势分析评分
    const recentData = safeData.slice(0, Math.min(10, safeData.length))
    const recentFreq = analyzeNumberFrequency(recentData, isFront)
    let trendScore = 0
    safeNumbers.forEach((num) => {
      const recent = recentFreq.find((f) => f.number === num)
      if (recent && recent.frequency > 0) {
        trendScore += 20
      }
    })
    trendScore = Math.min(100, trendScore)

    // 多样性评分
    const span = safeNumbers.length > 1 ? Math.max(...safeNumbers) - Math.min(...safeNumbers) : 0
    const maxSpan = isFront ? 34 : 11
    const diversityScore = Math.min(100, (span / maxSpan) * 100)

    // 综合评分
    const score = frequencyScore * 0.3 + balanceScore * 0.3 + trendScore * 0.2 + diversityScore * 0.2

    // 评级
    let overallRating = "待优化"
    if (score >= 80) overallRating = "优秀"
    else if (score >= 60) overallRating = "良好"
    else if (score >= 40) overallRating = "一般"

    const details = `综合评分${score.toFixed(1)}分，频率分析${frequencyScore.toFixed(1)}分，平衡性${balanceScore.toFixed(1)}分`

    return {
      score,
      analysis: {
        frequencyScore,
        balanceScore,
        trendScore,
        diversityScore,
        details,
        overallRating,
      },
    }
  } catch (error) {
    console.error("评估号码组合时出错:", error)
    return {
      score: 0,
      analysis: {
        frequencyScore: 0,
        balanceScore: 0,
        trendScore: 0,
        diversityScore: 0,
        details: "评估过程出错",
        overallRating: "无效",
      },
    }
  }
}
