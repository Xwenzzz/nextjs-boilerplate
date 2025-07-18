"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { LotteryDraw } from "@/types/lottery"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface PredictionTestProps {
  data: LotteryDraw[]
}

interface PredictionResult {
  strategy: string
  frontNumbers: number[]
  backNumbers: number[]
  frontMatches: number
  backMatches: number
  totalMatches: number
  matchRate: number
}

export default function PredictionTest({ data }: PredictionTestProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PredictionResult[]>([])
  const [actualDraw, setActualDraw] = useState<LotteryDraw | null>(null)
  const { toast } = useToast()

  // 生成随机号码
  const generateRandomNumbers = (count: number, max: number): number[] => {
    const result: number[] = []
    while (result.length < count) {
      const num = Math.floor(Math.random() * max) + 1
      if (!result.includes(num)) {
        result.push(num)
      }
    }
    return result.sort((a, b) => a - b)
  }

  // 生成热门号码
  const generateHotNumbers = (count: number, max: number, trainingData: LotteryDraw[]) => {
    try {
      // 统计频率
      const frequencies: Record<number, number> = {}
      for (let i = 1; i <= max; i++) frequencies[i] = 0

      trainingData.forEach((draw) => {
        const numbers = max === 35 ? draw.frontNumbers : draw.backNumbers
        if (numbers && Array.isArray(numbers)) {
          numbers.forEach((num) => {
            frequencies[num] = (frequencies[num] || 0) + 1
          })
        }
      })

      // 按频率排序
      const sortedNumbers = Object.entries(frequencies)
        .map(([num, freq]) => ({ num: Number(num), freq }))
        .sort((a, b) => b.freq - a.freq)
        .map((item) => item.num)

      // 选择前count个热门号码
      return sortedNumbers.slice(0, count)
    } catch (error) {
      console.error("Error in generateHotNumbers:", error)
      return generateRandomNumbers(count, max) // 出错时返回随机号码
    }
  }

  // 生成冷门号码
  const generateColdNumbers = (count: number, max: number, trainingData: LotteryDraw[]) => {
    try {
      // 统计频率
      const frequencies: Record<number, number> = {}
      for (let i = 1; i <= max; i++) frequencies[i] = 0

      trainingData.forEach((draw) => {
        const numbers = max === 35 ? draw.frontNumbers : draw.backNumbers
        if (numbers && Array.isArray(numbers)) {
          numbers.forEach((num) => {
            frequencies[num] = (frequencies[num] || 0) + 1
          })
        }
      })

      // 按频率排序（从低到高）
      const sortedNumbers = Object.entries(frequencies)
        .map(([num, freq]) => ({ num: Number(num), freq }))
        .sort((a, b) => a.freq - b.freq)
        .map((item) => item.num)

      // 选择前count个冷门号码
      return sortedNumbers.slice(0, count)
    } catch (error) {
      console.error("Error in generateColdNumbers:", error)
      return generateRandomNumbers(count, max) // 出错时返回随机号码
    }
  }

  // 综合分析选号
  const generateIntegratedNumbers = (count: number, max: number, trainingData: LotteryDraw[]) => {
    try {
      // 简化版的综合分析，结合热门和冷门号码
      const hotNumbers = generateHotNumbers(Math.ceil(count / 2), max, trainingData)
      const coldNumbers = generateColdNumbers(count - hotNumbers.length, max, trainingData).filter(
        (num) => !hotNumbers.includes(num),
      )

      const result = [...hotNumbers, ...coldNumbers]

      // 如果号码不足，随机补充
      while (result.length < count) {
        const num = Math.floor(Math.random() * max) + 1
        if (!result.includes(num)) {
          result.push(num)
        }
      }

      return result.sort((a, b) => a - b)
    } catch (error) {
      console.error("Error in generateIntegratedNumbers:", error)
      return generateRandomNumbers(count, max) // 出错时返回随机号码
    }
  }

  // 计算匹配数
  const countMatches = (predicted: number[], actual: number[]): number => {
    if (!predicted || !actual || !Array.isArray(predicted) || !Array.isArray(actual)) {
      return 0
    }
    return predicted.filter((num) => actual.includes(num)).length
  }

  // 运行预测测试
  const runTest = () => {
    if (!data || data.length < 2) {
      toast({
        title: "数据不足",
        description: "需要至少2期数据才能进行预测测试",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 使用最新一期作为测试数据
      const testDraw = data[0]
      // 使用除最新一期外的数据作为训练数据
      const trainingData = data.slice(1)

      setActualDraw(testDraw)

      // 不同策略的预测结果
      const predictionResults: PredictionResult[] = []

      // 1. 随机选号
      const randomFront = generateRandomNumbers(5, 35)
      const randomBack = generateRandomNumbers(2, 12)

      // 2. 热门号码
      const hotFront = generateHotNumbers(5, 35, trainingData)
      const hotBack = generateHotNumbers(2, 12, trainingData)

      // 3. 冷门号码
      const coldFront = generateColdNumbers(5, 35, trainingData)
      const coldBack = generateColdNumbers(2, 12, trainingData)

      // 4. 综合分析
      const integratedFront = generateIntegratedNumbers(5, 35, trainingData)
      const integratedBack = generateIntegratedNumbers(2, 12, trainingData)

      // 计算匹配率
      const actualFront = testDraw.frontNumbers || []
      const actualBack = testDraw.backNumbers || []

      // 添加随机选号结果
      predictionResults.push({
        strategy: "随机选号",
        frontNumbers: randomFront,
        backNumbers: randomBack,
        frontMatches: countMatches(randomFront, actualFront),
        backMatches: countMatches(randomBack, actualBack),
        totalMatches: countMatches(randomFront, actualFront) + countMatches(randomBack, actualBack),
        matchRate: (countMatches(randomFront, actualFront) / 5 + countMatches(randomBack, actualBack) / 2) / 2,
      })

      // 添加热门号码结果
      predictionResults.push({
        strategy: "热门号码",
        frontNumbers: hotFront,
        backNumbers: hotBack,
        frontMatches: countMatches(hotFront, actualFront),
        backMatches: countMatches(hotBack, actualBack),
        totalMatches: countMatches(hotFront, actualFront) + countMatches(hotBack, actualBack),
        matchRate: (countMatches(hotFront, actualFront) / 5 + countMatches(hotBack, actualBack) / 2) / 2,
      })

      // 添加冷门号码结果
      predictionResults.push({
        strategy: "冷门号码",
        frontNumbers: coldFront,
        backNumbers: coldBack,
        frontMatches: countMatches(coldFront, actualFront),
        backMatches: countMatches(coldBack, actualBack),
        totalMatches: countMatches(coldFront, actualFront) + countMatches(coldBack, actualBack),
        matchRate: (countMatches(coldFront, actualFront) / 5 + countMatches(coldBack, actualBack) / 2) / 2,
      })

      // 添加综合分析结果
      predictionResults.push({
        strategy: "综合分析",
        frontNumbers: integratedFront,
        backNumbers: integratedBack,
        frontMatches: countMatches(integratedFront, actualFront),
        backMatches: countMatches(integratedBack, actualBack),
        totalMatches: countMatches(integratedFront, actualFront) + countMatches(integratedBack, actualBack),
        matchRate: (countMatches(integratedFront, actualFront) / 5 + countMatches(integratedBack, actualBack) / 2) / 2,
      })

      // 更新结果
      setResults(predictionResults)
    } catch (error) {
      console.error("Error in runTest:", error)
      toast({
        title: "测试失败",
        description: "预测测试过程中发生错误",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染号码
  const renderNumbers = (numbers: number[]) => {
    if (!numbers || !Array.isArray(numbers)) return "无数据"
    return numbers.map((num) => (
      <span
        key={num}
        className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-semibold mr-1"
      >
        {num}
      </span>
    ))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>预测测试</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={runTest} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                测试中...
              </>
            ) : (
              "运行预测测试"
            )}
          </Button>
        </div>

        {actualDraw && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">实际开奖结果 (期号: {actualDraw.issueNo})</h3>
            <div className="mt-2">
              <p>前区: {renderNumbers(actualDraw.frontNumbers || [])}</p>
              <p>后区: {renderNumbers(actualDraw.backNumbers || [])}</p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>策略</TableHead>
                <TableHead>前区号码</TableHead>
                <TableHead>后区号码</TableHead>
                <TableHead>前区匹配</TableHead>
                <TableHead>后区匹配</TableHead>
                <TableHead>总匹配数</TableHead>
                <TableHead>匹配率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.strategy}</TableCell>
                  <TableCell>{renderNumbers(result.frontNumbers)}</TableCell>
                  <TableCell>{renderNumbers(result.backNumbers)}</TableCell>
                  <TableCell>{result.frontMatches}</TableCell>
                  <TableCell>{result.backMatches}</TableCell>
                  <TableCell>{result.totalMatches}</TableCell>
                  <TableCell>{(result.matchRate * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
