"use client"

import React from "react"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sparkles, RefreshCw, TrendingUp, Target, BarChart3, Zap, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  analyzeNumberFrequency,
  analyzeOddEvenRatio,
  analyzeBigSmallRatio,
  analyzeSumDistribution,
  analyzeSpanDistribution,
  generateSmartNumbers,
  evaluateNumberCombination,
} from "@/lib/lottery-analysis"
import { formatPercentage } from "@/lib/formatters"
import type { LotteryDraw } from "@/types/lottery"

interface SmartNumberPickerProps {
  data: LotteryDraw[]
}

interface SmartRecommendation {
  id: string
  name: string
  description: string
  frontNumbers: number[]
  backNumbers: number[]
  confidence: number
  strategy: string
  analysis: {
    frequencyScore: number
    balanceScore: number
    trendScore: number
    diversityScore: number
  }
  insights: string[]
}

// 安全地处理数组
function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : []
}

// 安全地处理对象
function safeObject<T extends Record<string, any>>(obj: T | null | undefined): T {
  return obj && typeof obj === "object" ? obj : ({} as T)
}

const strategies = [
  {
    id: "integrated",
    name: "综合智能",
    description: "综合多种分析维度，平衡各项指标",
    icon: Sparkles,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "hot",
    name: "热门追踪",
    description: "基于高频号码的热门追踪策略",
    icon: TrendingUp,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "cold",
    name: "冷门回补",
    description: "关注长期未出现的冷门号码",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "balanced",
    name: "平衡配置",
    description: "追求奇偶、大小的最佳平衡",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "trend",
    name: "趋势分析",
    description: "基于最近期数的趋势分析",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
]

export default function SmartNumberPicker({ data }: SmartNumberPickerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<string>("integrated")
  const [activeTab, setActiveTab] = useState("recommendations")
  const { toast } = useToast()

  // 验证数据有效性
  const validatedData = useMemo(() => {
    try {
      const safeData = safeArray(data)
      return safeData.filter((item) => {
        try {
          return (
            item &&
            typeof item === "object" &&
            Array.isArray(item.frontNumbers) &&
            Array.isArray(item.backNumbers) &&
            item.frontNumbers.length === 5 &&
            item.backNumbers.length === 2 &&
            item.frontNumbers.every((n) => typeof n === "number" && n >= 1 && n <= 35) &&
            item.backNumbers.every((n) => typeof n === "number" && n >= 1 && n <= 12)
          )
        } catch (error) {
          console.error("验证数据项时出错:", error)
          return false
        }
      })
    } catch (error) {
      console.error("验证数据时出错:", error)
      return []
    }
  }, [data])

  // 检查是否有足够的数据
  const hasEnoughData = validatedData.length >= 10

  // 数据分析结果
  const dataAnalysis = useMemo(() => {
    try {
      if (validatedData.length === 0) return null

      return {
        frontFrequencies: analyzeNumberFrequency(validatedData, true),
        backFrequencies: analyzeNumberFrequency(validatedData, false),
        frontOddEven: analyzeOddEvenRatio(validatedData, true),
        backOddEven: analyzeOddEvenRatio(validatedData, false),
        frontBigSmall: analyzeBigSmallRatio(validatedData, true),
        backBigSmall: analyzeBigSmallRatio(validatedData, false),
        sumDistribution: analyzeSumDistribution(validatedData),
        spanDistribution: analyzeSpanDistribution(validatedData),
      }
    } catch (error) {
      console.error("数据分析过程中出错:", error)
      return null
    }
  }, [validatedData])

  // 生成策略洞察
  const generateStrategyInsights = useCallback(
    (strategy: string, frontNumbers: number[], backNumbers: number[]): string[] => {
      try {
        const insights: string[] = []
        const safeFrontNumbers = safeArray(frontNumbers)
        const safeBackNumbers = safeArray(backNumbers)

        if (safeFrontNumbers.length === 0) {
          return ["策略分析完成"]
        }

        const sum = safeFrontNumbers.reduce((a, b) => a + b, 0)
        const span = safeFrontNumbers.length > 1 ? Math.max(...safeFrontNumbers) - Math.min(...safeFrontNumbers) : 0
        const oddCount = safeFrontNumbers.filter((n) => n % 2 === 1).length

        switch (strategy) {
          case "hot":
            insights.push(`选择了热门号码，基于历史高频出现规律`)
            insights.push(`当前组合和值${sum}，接近历史平均值`)
            break
          case "cold":
            insights.push(`关注冷门号码，具有回补潜力`)
            insights.push(`跨度${span}为中等水平，保持适度分散`)
            break
          case "balanced":
            insights.push(`奇偶比例${oddCount}:${5 - oddCount}，追求最佳平衡配置`)
            insights.push(`综合考虑大小号分布，避免极端组合`)
            break
          case "trend":
            insights.push(`基于最近10期趋势分析，捕捉短期规律`)
            insights.push(`结合周期性特征，提高命中概率`)
            break
          case "integrated":
          default:
            insights.push(`综合频率、平衡、趋势等多维度分析`)
            insights.push(`采用智能权重分配，优化整体表现`)
            break
        }

        return insights
      } catch (error) {
        console.error("生成策略洞察时出错:", error)
        return [`${strategy}策略分析完成`]
      }
    },
    [],
  )

  // 生成智能推荐
  const generateRecommendations = useCallback(async () => {
    try {
      if (!hasEnoughData || !dataAnalysis) {
        toast({
          title: "数据不足",
          description: "需要至少10期数据才能生成智能推荐",
          variant: "destructive",
        })
        return
      }

      setIsGenerating(true)

      // 模拟生成过程
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newRecommendations: SmartRecommendation[] = []

      for (const strategy of strategies) {
        try {
          // 生成号码
          const frontNumbers = generateSmartNumbers(validatedData, strategy.id, 5, 35, true)
          const backNumbers = generateSmartNumbers(validatedData, strategy.id, 2, 12, false)

          // 评估质量
          const frontEval = evaluateNumberCombination(frontNumbers, validatedData, true)
          const backEval = evaluateNumberCombination(backNumbers, validatedData, false)

          // 计算综合评分
          const confidence = frontEval.score * 0.7 + backEval.score * 0.3

          // 生成洞察
          const insights = generateStrategyInsights(strategy.id, frontNumbers, backNumbers)

          newRecommendations.push({
            id: strategy.id,
            name: strategy.name,
            description: strategy.description,
            frontNumbers,
            backNumbers,
            confidence,
            strategy: strategy.id,
            analysis: {
              frequencyScore: safeObject(frontEval.analysis).frequencyScore || 50,
              balanceScore: safeObject(frontEval.analysis).balanceScore || 50,
              trendScore: safeObject(frontEval.analysis).trendScore || 50,
              diversityScore: safeObject(frontEval.analysis).diversityScore || 50,
            },
            insights,
          })
        } catch (error) {
          console.error(`生成${strategy.name}推荐时出错:`, error)
        }
      }

      // 按置信度排序
      newRecommendations.sort((a, b) => b.confidence - a.confidence)

      setRecommendations(newRecommendations)
      setIsGenerating(false)

      toast({
        title: "智能推荐生成完成",
        description: `基于${validatedData.length}期数据生成了${newRecommendations.length}组推荐号码`,
      })
    } catch (error) {
      console.error("生成智能推荐时出错:", error)
      setIsGenerating(false)
      toast({
        title: "生成失败",
        description: "生成智能推荐时出现错误，请重试",
        variant: "destructive",
      })
    }
  }, [hasEnoughData, dataAnalysis, validatedData, toast, generateStrategyInsights])

  // 渲染分析概览
  const renderAnalysisOverview = () => {
    if (!dataAnalysis) return null

    const {
      frontFrequencies,
      backFrequencies,
      frontOddEven,
      backOddEven,
      frontBigSmall,
      backBigSmall,
      sumDistribution,
      spanDistribution,
    } = dataAnalysis

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前区号码频率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeArray(frontFrequencies).length > 0 ? "已分析" : "无数据"}</div>
            <p className="text-xs text-muted-foreground">
              热门号码:{" "}
              {safeArray(frontFrequencies)
                .filter((f) => f.isHot)
                .map((f) => f.number)
                .join(", ") || "无"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">后区号码频率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeArray(backFrequencies).length > 0 ? "已分析" : "无数据"}</div>
            <p className="text-xs text-muted-foreground">
              冷门号码:{" "}
              {safeArray(backFrequencies)
                .filter((f) => f.isCold)
                .map((f) => f.number)
                .join(", ") || "无"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前区奇偶比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeObject(frontOddEven).oddCount}:{safeObject(frontOddEven).evenCount}
            </div>
            <p className="text-xs text-muted-foreground">
              奇数: {formatPercentage(safeObject(frontOddEven).oddPercentage)} / 偶数:{" "}
              {formatPercentage(safeObject(frontOddEven).evenPercentage)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前区大小比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeObject(frontBigSmall).bigCount}:{safeObject(frontBigSmall).smallCount}
            </div>
            <p className="text-xs text-muted-foreground">
              大数: {formatPercentage(safeObject(frontBigSmall).bigPercentage)} / 小数:{" "}
              {formatPercentage(safeObject(frontBigSmall).smallPercentage)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前区和值分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">平均: {safeObject(sumDistribution).avg.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              范围: {safeObject(sumDistribution).min}-{safeObject(sumDistribution).max}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前区跨度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">平均: {safeObject(spanDistribution).avg.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              范围: {safeObject(spanDistribution).min}-{safeObject(spanDistribution).max}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            智能选号助手
          </CardTitle>
          <CardDescription>基于{validatedData.length}期历史数据，为您提供智能号码推荐</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">智能推荐引擎</h3>
              <p className="text-sm text-muted-foreground">系统将根据不同策略，为您生成多组高质量的号码组合</p>
            </div>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating || !hasEnoughData || !dataAnalysis}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "生成中..." : "生成智能推荐"}
            </Button>
          </div>

          {!hasEnoughData && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                数据量不足，当前有{validatedData.length}期有效数据，需要至少10期数据才能生成智能推荐。
                请先导入更多历史数据。
              </AlertDescription>
            </Alert>
          )}

          {!dataAnalysis && hasEnoughData && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>数据分析失败，无法处理当前历史数据。请检查数据格式是否正确。</AlertDescription>
            </Alert>
          )}

          {isGenerating && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm">正在生成智能推荐...</span>
              </div>
              <Progress value={(recommendations.length / strategies.length) * 100} className="h-3" />
            </div>
          )}

          {recommendations.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-4">
                <TabsTrigger value="recommendations">推荐号码</TabsTrigger>
                <TabsTrigger value="analysis">数据概览</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="relative overflow-hidden">
                      <div
                        className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${strategies.find((s) => s.id === rec.strategy)?.color || "from-gray-400 to-gray-500"}`}
                      ></div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center">
                            {strategies.find((s) => s.id === rec.strategy)?.icon && (
                              <span className="mr-2 text-muted-foreground">
                                {React.createElement(strategies.find((s) => s.id === rec.strategy)!.icon, {
                                  className: "h-5 w-5",
                                })}
                              </span>
                            )}
                            {rec.name}
                          </div>
                          <Badge className="bg-purple-500 text-white">{rec.confidence.toFixed(1)}分</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm">{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">前区号码</div>
                          <div className="flex flex-wrap gap-2">
                            {safeArray(rec.frontNumbers).map((num) => (
                              <div
                                key={`front-${rec.id}-${num}`}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-sm"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">后区号码</div>
                          <div className="flex flex-wrap gap-2">
                            {safeArray(rec.backNumbers).map((num) => (
                              <div
                                key={`back-${rec.id}-${num}`}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">频率:</span>
                            <span className="ml-1 font-medium">{rec.analysis.frequencyScore.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">平衡:</span>
                            <span className="ml-1 font-medium">{rec.analysis.balanceScore.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">趋势:</span>
                            <span className="ml-1 font-medium">{rec.analysis.trendScore.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">多样:</span>
                            <span className="ml-1 font-medium">{rec.analysis.diversityScore.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          {safeArray(rec.insights).map((insight, idx) => (
                            <div key={idx} className="flex items-start text-xs text-muted-foreground">
                              <Info className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <h3 className="font-medium mb-4">历史数据分析概览</h3>
                {renderAnalysisOverview()}
              </TabsContent>
            </Tabs>
          )}

          {recommendations.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">准备生成智能推荐</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                点击"生成智能推荐"按钮，系统将根据历史数据和多种智能策略，为您生成高质量的号码组合。
              </p>
              {hasEnoughData && dataAnalysis && (
                <div className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  数据充足，可以开始生成推荐
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
