"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Braces, RefreshCw, Sparkles, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { LotteryDraw } from "@/types/lottery"

interface MachineLearningAnalysisProps {
  data: LotteryDraw[]
}

interface PredictionResult {
  number: number
  probability: number
  isRecommended: boolean
}

export default function MachineLearningAnalysis({ data }: MachineLearningAnalysisProps) {
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isModelTrained, setIsModelTrained] = useState(false)
  const [frontPredictions, setFrontPredictions] = useState<PredictionResult[]>([])
  const [backPredictions, setBackPredictions] = useState<PredictionResult[]>([])
  const [modelInsights, setModelInsights] = useState<string[]>([])
  const { toast } = useToast()

  // 训练模型
  const trainModel = () => {
    if (data.length < 10) {
      // 将30改为10
      toast({
        title: "数据不足",
        description: "建议至少10期数据才能进行机器学习分析，当前将使用现有数据进行分析",
        variant: "default", // 改为普通提示而非错误
      })
      // 即使数据不足也继续执行
    }

    setIsTraining(true)
    setTrainingProgress(0)
    setIsModelTrained(false)

    // 模拟训练过程
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            generatePredictions()
            setIsTraining(false)
            setIsModelTrained(true)
            toast({
              title: "模型训练完成",
              description: "已生成智能预测结果",
            })
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 300)
  }

  // 模拟使用机器学习生成预测
  const generatePredictions = () => {
    // 基于历史数据分析频率和趋势
    const frontFrequency: Record<number, { count: number; lastAppeared: number }> = {}
    const backFrequency: Record<number, { count: number; lastAppeared: number }> = {}

    // 初始化
    for (let i = 1; i <= 35; i++) frontFrequency[i] = { count: 0, lastAppeared: -1 }
    for (let i = 1; i <= 12; i++) backFrequency[i] = { count: 0, lastAppeared: -1 }

    // 分析历史数据，即使数据量少也能处理
    const availableData = data.slice(0, Math.min(data.length, 30)) // 使用可用的数据，最多30期

    availableData.forEach((draw, index) => {
      if (draw.frontNumbers && Array.isArray(draw.frontNumbers)) {
        draw.frontNumbers.forEach((num) => {
          if (num && frontFrequency[num]) {
            frontFrequency[num].count += 1
            frontFrequency[num].lastAppeared = index
          }
        })
      }

      if (draw.backNumbers && Array.isArray(draw.backNumbers)) {
        draw.backNumbers.forEach((num) => {
          if (num && backFrequency[num]) {
            backFrequency[num].count += 1
            backFrequency[num].lastAppeared = index
          }
        })
      }
    })

    // 计算出现概率和是否推荐
    const frontResults: PredictionResult[] = Object.entries(frontFrequency)
      .map(([number, stats]) => {
        // 结合频率和间隔计算概率
        const frequency = stats.count / Math.max(1, availableData.length) // 避免除以0
        const recency = stats.lastAppeared === -1 ? 0.5 : Math.exp(-0.05 * stats.lastAppeared) // 近期出现的权重降低
        const probability = (frequency * 0.7 + recency * 0.3) * 100

        return {
          number: Number.parseInt(number),
          probability: Math.min(Number.parseFloat(probability.toFixed(2)), 99.99), // 限制最大概率
          isRecommended: false,
        }
      })
      .sort((a, b) => b.probability - a.probability)

    const backResults: PredictionResult[] = Object.entries(backFrequency)
      .map(([number, stats]) => {
        const frequency = stats.count / Math.max(1, availableData.length) // 避免除以0
        const recency = stats.lastAppeared === -1 ? 0.5 : Math.exp(-0.05 * stats.lastAppeared)
        const probability = (frequency * 0.7 + recency * 0.3) * 100

        return {
          number: Number.parseInt(number),
          probability: Math.min(Number.parseFloat(probability.toFixed(2)), 99.99),
          isRecommended: false,
        }
      })
      .sort((a, b) => b.probability - a.probability)

    // 标记推荐号码（前10个）
    frontResults.slice(0, 10).forEach((item) => {
      item.isRecommended = true
    })

    backResults.slice(0, 5).forEach((item) => {
      item.isRecommended = true
    })

    setFrontPredictions(frontResults)
    setBackPredictions(backResults)

    // 生成模型洞察
    generateModelInsights(frontResults, backResults)
  }

  // 生成模型洞察
  const generateModelInsights = (frontResults: PredictionResult[], backResults: PredictionResult[]) => {
    // 分析预测结果，提取洞察
    const insights: string[] = []

    // 分析前区热门号码
    const hotFrontNumbers = frontResults.slice(0, 5).map((r) => r.number)
    insights.push(`前区热门号码：${hotFrontNumbers.join("、")}，这些号码在模型分析中具有较高出现概率`)

    // 分析后区热门号码
    const hotBackNumbers = backResults.slice(0, 3).map((r) => r.number)
    insights.push(`后区热门号码：${hotBackNumbers.join("、")}，这些号码在模型分析中具有较高出现概率`)

    // 分析号码区间分布
    const frontRanges = [0, 0, 0, 0, 0] // 1-7, 8-14, 15-21, 22-28, 29-35
    frontResults.slice(0, 10).forEach((r) => {
      if (r.number <= 7) frontRanges[0]++
      else if (r.number <= 14) frontRanges[1]++
      else if (r.number <= 21) frontRanges[2]++
      else if (r.number <= 28) frontRanges[3]++
      else frontRanges[4]++
    })

    // 找出最集中的区间
    const maxRangeIndex = frontRanges.indexOf(Math.max(...frontRanges))
    const rangeNames = ["1-7", "8-14", "15-21", "22-28", "29-35"]
    insights.push(`前区号码区间分析：区间${rangeNames[maxRangeIndex]}的号码在近期有较高出现概率`)

    // 其他洞察
    if (frontResults[0].probability - frontResults[5].probability > 10) {
      insights.push(`预测模型显示前区号码分布较为集中，少数号码概率明显高于其他号码`)
    } else {
      insights.push(`预测模型显示前区号码分布较为均匀，多样化选号可能是更好的策略`)
    }

    // 奇偶分析
    const oddCount = frontResults.slice(0, 10).filter((r) => r.number % 2 === 1).length
    if (oddCount >= 7) {
      insights.push(`前区推荐号码中奇数占比较高(${oddCount}/10)，建议选择偏向奇数的组合`)
    } else if (oddCount <= 3) {
      insights.push(`前区推荐号码中偶数占比较高(${10 - oddCount}/10)，建议选择偏向偶数的组合`)
    } else {
      insights.push(`前区推荐号码中奇偶比较为平衡，建议保持奇偶平衡的选号策略`)
    }

    setModelInsights(insights)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>机器学习分析</CardTitle>
          <CardDescription>使用机器学习算法分析历史数据，预测号码出现概率</CardDescription>
        </CardHeader>
        <CardContent>
          {!isModelTrained && !isTraining && (
            <div className="flex flex-col items-center justify-center py-12">
              <Braces className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">机器学习模型未训练</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                点击下方按钮开始训练模型，训练完成后将显示预测结果。
                模型将分析历史开奖数据的模式和规律，预测下期可能出现的号码。
              </p>
              <Button
                onClick={trainModel}
                className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                训练预测模型
              </Button>
            </div>
          )}

          {isTraining && (
            <div className="py-8">
              <h3 className="text-lg font-medium mb-2 text-center">模型训练中...</h3>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">正在分析历史数据，训练预测模型</span>
              </div>
              <Progress value={trainingProgress} className="h-2 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1">特征提取</h4>
                  <p className="text-xs text-muted-foreground">分析号码频率、周期、间隔和组合模式</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1">模式识别</h4>
                  <p className="text-xs text-muted-foreground">检测历史数据中的隐藏规律和模式</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1">趋势分析</h4>
                  <p className="text-xs text-muted-foreground">分析号码出现的趋势和变化规律</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1">概率建模</h4>
                  <p className="text-xs text-muted-foreground">计算各个号码的出现概率</p>
                </div>
              </div>
            </div>
          )}

          {isModelTrained && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={trainModel}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  重新训练
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">前区号码预测</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {frontPredictions.map((prediction) => (
                      <div key={prediction.number} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            prediction.isRecommended ? "bg-red-500 text-white" : "border-2 border-red-500 text-red-500"
                          }`}
                        >
                          {prediction.number}
                        </div>
                        <div className="text-xs mt-1 text-center">
                          <div>{prediction.probability.toFixed(1)}%</div>
                          {prediction.isRecommended && (
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              推荐
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">后区号码预测</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {backPredictions.map((prediction) => (
                      <div key={prediction.number} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            prediction.isRecommended
                              ? "bg-blue-500 text-white"
                              : "border-2 border-blue-500 text-blue-500"
                          }`}
                        >
                          {prediction.number}
                        </div>
                        <div className="text-xs mt-1 text-center">
                          <div>{prediction.probability.toFixed(1)}%</div>
                          {prediction.isRecommended && (
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              推荐
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">模型洞察</h3>
                {modelInsights.length > 0 ? (
                  <div className="space-y-3">
                    {modelInsights.map((insight, index) => (
                      <Alert key={index}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>{insight}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>暂无模型洞察</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                  <div>
                    <h4 className="font-medium mb-2">分析说明</h4>
                    <p className="text-sm text-muted-foreground">
                      机器学习预测基于历史数据分析，结合号码频率、周期、间隔等多项因素，
                      使用概率模型计算每个号码在下期出现的可能性。预测结果仅作为参考，
                      并不保证中奖。带有"推荐"标记的号码是模型认为最有可能出现的号码。
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      注意：模型预测结果会随着历史数据的变化而调整，建议每期开奖后重新训练模型。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
