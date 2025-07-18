"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, RefreshCw, Sparkles, AlertTriangle, LineChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { LotteryDraw } from "@/types/lottery"

interface PredictionEvaluationProps {
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

export default function PredictionEvaluation({ data }: PredictionEvaluationProps) {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("results")
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([])
  const [actualDraw, setActualDraw] = useState<LotteryDraw | null>(null)
  const [predictedDraw, setPredictedDraw] = useState<LotteryDraw | null>(null)
  const [errorAnalysis, setErrorAnalysis] = useState<string[]>([])
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
    // 统计频率
    const frequencies: Record<number, number> = {}
    for (let i = 1; i <= max; i++) frequencies[i] = 0

    trainingData.forEach((draw) => {
      const numbers = max === 35 ? draw.frontNumbers : draw.backNumbers
      if (numbers) {
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
  }

  // 生成冷门号码
  const generateColdNumbers = (count: number, max: number, trainingData: LotteryDraw[]) => {
    // 统计频率
    const frequencies: Record<number, number> = {}
    for (let i = 1; i <= max; i++) frequencies[i] = 0

    trainingData.forEach((draw) => {
      const numbers = max === 35 ? draw.frontNumbers : draw.backNumbers
      if (numbers) {
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
  }

  // 综合分析选号
  const generateIntegratedNumbers = (count: number, max: number, trainingData: LotteryDraw[]) => {
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
  }

  // 运行预测测试
  const runPrediction = () => {
    if (data.length < 2) {
      toast({
        title: "数据不足",
        description: "需要至少2期数据才能进行预测测试",
        variant: "destructive",
      })
      return
    }

    setIsEvaluating(true)
    setProgress(0)

    // 模拟进度
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5
        return newProgress >= 90 ? 90 : newProgress
      })
    }, 100)

    // 使用最新一期作为测试数据
    const testDraw = data[0]
    setActualDraw(testDraw)

    // 使用除最新一期外的数据作为训练数据
    const trainingData = data.slice(1)

    // 使用不同策略进行预测
    setTimeout(() => {
      const results: PredictionResult[] = []

      // 1. 热门号码策略
      const hotFrontNumbers = generateHotNumbers(5, 35, trainingData)
      const hotBackNumbers = generateHotNumbers(2, 12, trainingData)

      // 2. 冷门号码策略
      const coldFrontNumbers = generateColdNumbers(5, 35, trainingData)
      const coldBackNumbers = generateColdNumbers(2, 12, trainingData)

      // 3. 随机号码策略
      const randomFrontNumbers = generateRandomNumbers(5, 35)
      const randomBackNumbers = generateRandomNumbers(2, 12)

      // 4. 综合分析策略
      const integratedFrontNumbers = generateIntegratedNumbers(5, 35, trainingData)
      const integratedBackNumbers = generateIntegratedNumbers(2, 12, trainingData)

      // 计算匹配情况
      const strategies = [
        { name: "热门号码策略", front: hotFrontNumbers, back: hotBackNumbers },
        { name: "冷门号码策略", front: coldFrontNumbers, back: coldBackNumbers },
        { name: "随机号码策略", front: randomFrontNumbers, back: randomBackNumbers },
        { name: "综合分析策略", front: integratedFrontNumbers, back: integratedBackNumbers },
      ]

      strategies.forEach((strategy) => {
        const frontMatches = testDraw.frontNumbers.filter((num) => strategy.front.includes(num)).length
        const backMatches = testDraw.backNumbers.filter((num) => strategy.back.includes(num)).length
        const totalMatches = frontMatches + backMatches
        const matchRate = totalMatches / (testDraw.frontNumbers.length + testDraw.backNumbers.length)

        results.push({
          strategy: strategy.name,
          frontNumbers: strategy.front,
          backNumbers: strategy.back,
          frontMatches,
          backMatches,
          totalMatches,
          matchRate,
        })
      })

      // 按匹配率排序
      results.sort((a, b) => b.matchRate - a.matchRate)
      setPredictionResults(results)

      // 设置最佳预测结果
      if (results.length > 0) {
        const bestResult = results[0]
        setPredictedDraw({
          drawNumber: testDraw.drawNumber,
          drawDate: testDraw.drawDate,
          frontNumbers: bestResult.frontNumbers,
          backNumbers: bestResult.backNumbers,
          prize: "预测",
          sales: "预测",
        })

        // 分析预测错误的原因
        analyzeErrors(bestResult, testDraw)
      }

      clearInterval(progressInterval)
      setProgress(100)
      setIsEvaluating(false)

      toast({
        title: "预测评估完成",
        description: `已完成${results.length}种策略的预测评估`,
      })
    }, 1500)
  }

  // 分析预测错误的原因
  const analyzeErrors = (prediction: PredictionResult, actual: LotteryDraw) => {
    const errors: string[] = []

    // 1. 分析前区匹配情况
    if (prediction.frontMatches < 3) {
      // 分析奇偶比
      const predictedOddCount = prediction.frontNumbers.filter((n) => n % 2 === 1).length
      const actualOddCount = actual.frontNumbers.filter((n) => n % 2 === 1).length

      if (Math.abs(predictedOddCount - actualOddCount) >= 2) {
        errors.push(
          `前区奇偶比预测不准确：预测(${predictedOddCount}:${5 - predictedOddCount})，实际(${actualOddCount}:${5 - actualOddCount})`,
        )
      }

      // 分析大小比
      const predictedBigCount = prediction.frontNumbers.filter((n) => n > 18).length
      const actualBigCount = actual.frontNumbers.filter((n) => n > 18).length

      if (Math.abs(predictedBigCount - actualBigCount) >= 2) {
        errors.push(
          `前区大小比预测不准确：预测(${predictedBigCount}:${5 - predictedBigCount})，实际(${actualBigCount}:${5 - actualBigCount})`,
        )
      }

      // 分析和值
      const predictedSum = prediction.frontNumbers.reduce((sum, n) => sum + n, 0)
      const actualSum = actual.frontNumbers.reduce((sum, n) => sum + n, 0)

      if (Math.abs(predictedSum - actualSum) > 30) {
        errors.push(`前区和值预测偏差较大：预测(${predictedSum})，实际(${actualSum})`)
      }

      // 分析跨度
      const predictedSpan = Math.max(...prediction.frontNumbers) - Math.min(...prediction.frontNumbers)
      const actualSpan = Math.max(...actual.frontNumbers) - Math.min(...actual.frontNumbers)

      if (Math.abs(predictedSpan - actualSpan) > 10) {
        errors.push(`前区跨度预测偏差较大：预测(${predictedSpan})，实际(${actualSpan})`)
      }
    }

    // 2. 分析后区匹配情况
    if (prediction.backMatches === 0) {
      errors.push("后区号码完全不匹配，可能是随机性因素导致")
    }

    // 3. 总体分析
    if (prediction.totalMatches === 0) {
      errors.push("本期开奖号码与历史数据规律偏离较大，具有较强的随机性")
    } else if (prediction.matchRate < 0.3) {
      errors.push("预测准确率较低，建议优化预测模型或结合多种策略")
    }

    // 如果没有找到明显错误原因
    if (errors.length === 0) {
      errors.push("预测与实际结果存在差异，彩票开奖具有较高随机性，难以完全准确预测")
    }

    setErrorAnalysis(errors)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>预测评估</CardTitle>
          <CardDescription>使用历史数据预测最新一期开奖结果，并与实际结果对比分析</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">预测模型评估</h3>
              <p className="text-sm text-muted-foreground">
                使用历史数据训练模型，预测最新一期开奖结果，并与实际结果对比
              </p>
            </div>
            <Button
              onClick={runPrediction}
              disabled={isEvaluating}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isEvaluating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isEvaluating ? "评估中..." : "运行预测评估"}
            </Button>
          </div>

          {isEvaluating && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">正在分析历史数据，评估预测准确率...</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {predictionResults.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="results" className="text-xs sm:text-sm">
                  预测结果
                </TabsTrigger>
                <TabsTrigger value="comparison" className="text-xs sm:text-sm">
                  对比分析
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs sm:text-sm">
                  错误分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results">
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>预测策略</TableHead>
                        <TableHead>前区匹配</TableHead>
                        <TableHead>后区匹配</TableHead>
                        <TableHead>总匹配率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictionResults.map((result, index) => (
                        <TableRow key={index} className={index === 0 ? "bg-green-50 dark:bg-green-900/20" : ""}>
                          <TableCell className="font-medium">
                            {result.strategy}
                            {index === 0 && <Badge className="ml-2 bg-green-500">最佳</Badge>}
                          </TableCell>
                          <TableCell>
                            {result.frontMatches}/{result.frontNumbers.length} (
                            {((result.frontMatches / result.frontNumbers.length) * 100).toFixed(1)}%)
                          </TableCell>
                          <TableCell>
                            {result.backMatches}/{result.backNumbers.length} (
                            {((result.backMatches / result.backNumbers.length) * 100).toFixed(1)}%)
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.matchRate > 0.3 ? "default" : "outline"}>
                              {(result.matchRate * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="comparison">
                {actualDraw && predictedDraw && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="py-3 bg-gradient-to-r from-blue-500 to-blue-600">
                        <CardTitle className="text-white text-sm">
                          实际开奖结果 (期号: {actualDraw.drawNumber})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">前区号码</div>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {actualDraw.frontNumbers.map((num) => (
                                <div
                                  key={`actual-front-${num}`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">后区号码</div>
                            <div className="flex flex-wrap gap-2">
                              {actualDraw.backNumbers.map((num) => (
                                <div
                                  key={`actual-back-${num}`}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="py-3 bg-gradient-to-r from-purple-500 to-purple-600">
                        <CardTitle className="text-white text-sm">
                          预测结果 (最佳策略: {predictionResults[0]?.strategy})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">前区号码</div>
                            <div className="flex flex-wrap gap-2">
                              {predictedDraw.frontNumbers.map((num) => (
                                <div
                                  key={`predicted-front-${num}`}
                                  className={`w-8 h-8 rounded-full ${
                                    actualDraw.frontNumbers.includes(num)
                                      ? "bg-gradient-to-br from-green-500 to-green-600"
                                      : "bg-gradient-to-br from-gray-400 to-gray-500"
                                  } text-white flex items-center justify-center font-bold shadow-sm`}
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">后区号码</div>
                            <div className="flex flex-wrap gap-2">
                              {predictedDraw.backNumbers.map((num) => (
                                <div
                                  key={`predicted-back-${num}`}
                                  className={`w-8 h-8 rounded-full ${
                                    actualDraw.backNumbers.includes(num)
                                      ? "bg-gradient-to-br from-green-500 to-green-600"
                                      : "bg-gradient-to-br from-gray-400 to-gray-500"
                                  } text-white flex items-center justify-center font-bold shadow-sm`}
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">匹配分析</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-md p-3 text-center">
                              <div className="text-2xl font-bold">
                                {predictionResults[0]?.frontMatches || 0}/{actualDraw.frontNumbers.length}
                              </div>
                              <div className="text-sm text-muted-foreground">前区匹配</div>
                            </div>
                            <div className="border rounded-md p-3 text-center">
                              <div className="text-2xl font-bold">
                                {predictionResults[0]?.backMatches || 0}/{actualDraw.backNumbers.length}
                              </div>
                              <div className="text-sm text-muted-foreground">后区匹配</div>
                            </div>
                            <div className="border rounded-md p-3 text-center">
                              <div className="text-2xl font-bold">
                                {((predictionResults[0]?.matchRate || 0) * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-muted-foreground">总匹配率</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="errors">
                <div className="space-y-4">
                  <h3 className="font-medium">预测错误分析</h3>

                  {errorAnalysis.length > 0 ? (
                    <div className="space-y-2">
                      {errorAnalysis.map((error, index) => (
                        <Alert key={index}>
                          <Info className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>尚未进行错误分析</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                      <div>
                        <h4 className="font-medium mb-2">预测难点分析</h4>
                        <p className="text-sm text-muted-foreground">
                          彩票开奖结果具有较高的随机性，即使使用最先进的数据分析和机器学习技术，也难以实现高准确率的预测。
                          影响预测准确率的因素包括：历史数据的有限性、开奖机制的随机性、数学模型的局限性等。
                          本系统的预测仅作为参考，不应作为投注决策的唯一依据。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {predictionResults.length === 0 && !isEvaluating && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">尚未进行预测评估</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                点击"运行预测评估"按钮，系统将使用历史数据训练模型，预测最新一期开奖结果，并与实际结果对比。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
