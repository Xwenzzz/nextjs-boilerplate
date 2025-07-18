"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, TrendingDown, AlertCircle, BarChart3, Target, Brain, Lightbulb } from "lucide-react"
import { calculateLotteryOdds, analyzePredictionResults } from "@/lib/utils"

interface PredictionAnalysisProps {
  userPredictions?: number[][]
  actualResult?: number[]
  date?: string
}

export default function PredictionAnalysis({ userPredictions, actualResult, date }: PredictionAnalysisProps) {
  const [activeTab, setActiveTab] = useState("analysis")

  // 示例数据 - 用户7月16日的预测
  const examplePredictions = [
    [11, 15, 21, 22, 29, 1, 1], // 注意：后区重复了，这是一个问题
    [2, 6, 9, 15, 29, 1, 7],
    [6, 9, 15, 20, 30, 1, 7],
    [1, 2, 4, 7, 15, 5, 6],
    [1, 6, 9, 32, 35, 7, 9],
  ]

  // 7月16日实际开奖结果
  const exampleActual = [9, 10, 18, 22, 24, 3, 12]

  const predictions = userPredictions || examplePredictions
  const actual = actualResult || exampleActual
  const drawDate = date || "2024年7月16日"

  // 计算彩票概率
  const odds = calculateLotteryOdds()

  // 分析预测结果
  const analysisResults = analyzePredictionResults(predictions, actual)

  // 计算总体统计
  const totalMatches = analysisResults.reduce((sum, result) => sum + result.totalMatches, 0)
  const bestResult = analysisResults.reduce((best, current) =>
    current.totalMatches > best.totalMatches ? current : best,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            预测结果分析 - {drawDate}
          </CardTitle>
          <CardDescription>分析您的预测准确性，并解释彩票预测的数学原理</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="analysis">结果分析</TabsTrigger>
              <TabsTrigger value="probability">概率解释</TabsTrigger>
              <TabsTrigger value="problems">问题诊断</TabsTrigger>
              <TabsTrigger value="suggestions">改进建议</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{totalMatches}</div>
                      <div className="text-sm text-muted-foreground">总命中号码</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{bestResult.totalMatches}</div>
                      <div className="text-sm text-muted-foreground">最佳单组命中</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {((totalMatches / (predictions.length * 7)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">总体命中率</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">实际开奖号码</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">前区：</span>
                  {actual.slice(0, 5).map((num, index) => (
                    <Badge key={index} className="bg-red-500 text-white">
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  ))}
                  <span className="text-sm text-muted-foreground ml-4">后区：</span>
                  {actual.slice(5, 7).map((num, index) => (
                    <Badge key={index} className="bg-blue-500 text-white">
                      {num.toString().padStart(2, "0")}
                    </Badge>
                  ))}
                </div>

                <h3 className="text-lg font-semibold">您的预测分析</h3>
                {analysisResults.map((result) => (
                  <Card key={result.group} className="border-l-4 border-l-gray-300">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">第{result.group}组预测</h4>
                        <Badge variant={result.totalMatches > 0 ? "default" : "secondary"}>
                          命中{result.totalMatches}个
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">前区：</span>
                        {result.prediction.slice(0, 5).map((num, index) => {
                          const isMatch = actual.slice(0, 5).includes(num)
                          return (
                            <Badge
                              key={index}
                              className={isMatch ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}
                            >
                              {num.toString().padStart(2, "0")}
                            </Badge>
                          )
                        })}
                        <span className="text-sm text-muted-foreground ml-4">后区：</span>
                        {result.prediction.slice(5, 7).map((num, index) => {
                          const isMatch = actual.slice(5, 7).includes(num)
                          return (
                            <Badge
                              key={index}
                              className={isMatch ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}
                            >
                              {num.toString().padStart(2, "0")}
                            </Badge>
                          )
                        })}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        前区命中: {result.frontMatches}/5 | 后区命中: {result.backMatches}/2
                        {result.matchedNumbers.length > 0 && (
                          <span className="text-green-600 ml-2">命中号码: {result.matchedNumbers.join(", ")}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="probability" className="space-y-6">
              <Alert>
                <Calculator className="h-4 w-4" />
                <AlertDescription>
                  <strong>大乐透中奖概率数学分析</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">基础概率计算</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">前区概率 (35选5)</div>
                      <div className="text-lg font-mono">C(35,5) = {odds.frontOdds.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">后区概率 (12选2)</div>
                      <div className="text-lg font-mono">C(12,2) = {odds.backOdds.toLocaleString()}</div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">总概率</div>
                      <div className="text-xl font-bold text-red-600">1 / {odds.totalOdds.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        约等于 {(odds.probability * 100).toExponential(2)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">实际意义</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm">如果每期买1注，理论上需要购买：</div>
                      <div className="text-lg font-bold">{Math.round(odds.totalOdds / 104)} 年</div>
                      <div className="text-xs text-muted-foreground">(按每年104期计算)</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">您买了5注，单期中奖概率：</div>
                      <div className="text-lg font-bold">{((5 / odds.totalOdds) * 100).toExponential(2)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">命中单个号码的概率：</div>
                      <div className="text-lg font-bold">约14.3% (前区) / 16.7% (后区)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>重要提醒：</strong>即使使用最先进的AI算法，也无法显著提高中奖概率。
                  彩票本质上是随机事件，每个号码在每期开奖中都有相等的概率被选中。
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="problems" className="space-y-6">
              <Alert>
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  <strong>发现的问题</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-red-600 mb-2">1. 号码重复错误</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      第1组预测中后区号码重复 (01, 01)，这在大乐透中是不可能的。
                    </p>
                    <div className="bg-red-50 p-2 rounded text-sm">
                      错误预测: 11, 15, 21, 22, 29, <span className="text-red-600 font-bold">01, 01</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-orange-600 mb-2">2. 号码分布不均</h4>
                    <p className="text-sm text-muted-foreground mb-2">多组预测都集中在小号码区间，缺乏大号码的覆盖。</p>
                    <div className="space-y-1 text-sm">
                      <div>小号码(1-18): 过度集中</div>
                      <div>大号码(19-35): 覆盖不足</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-yellow-600 mb-2">3. 策略单一化</h4>
                    <p className="text-sm text-muted-foreground">
                      5组预测使用了相似的选号策略，没有充分利用不同的分析方法。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>改进建议</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      技术改进
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h5 className="font-medium">1. 数据验证</h5>
                      <p className="text-sm text-muted-foreground">添加号码重复检查，确保预测结果的有效性</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">2. 分布优化</h5>
                      <p className="text-sm text-muted-foreground">平衡大小号码、奇偶号码的分布比例</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">3. 多策略融合</h5>
                      <p className="text-sm text-muted-foreground">结合热号、冷号、趋势分析等多种策略</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      理性建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h5 className="font-medium">1. 降低期望</h5>
                      <p className="text-sm text-muted-foreground">理解彩票的随机性，不要期望AI能显著提高中奖率</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">2. 娱乐为主</h5>
                      <p className="text-sm text-muted-foreground">将购彩视为娱乐活动，控制投入金额</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium">3. 学习概率</h5>
                      <p className="text-sm text-muted-foreground">了解概率知识，做出理性的决策</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">系统优化建议</h4>
                  <div className="space-y-2 text-sm">
                    <div>• 添加号码有效性验证功能</div>
                    <div>• 实现多种选号策略的智能组合</div>
                    <div>• 提供更详细的概率教育内容</div>
                    <div>• 增加历史预测准确率统计</div>
                    <div>• 添加理性购彩提醒功能</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
