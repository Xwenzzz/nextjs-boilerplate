"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface TrendCycleAnalysisProps {
  data: LotteryDraw[]
}

interface NumberTrend {
  number: number
  lastAppearance: number
  cycleLength: number | null
  trend: "rising" | "falling" | "stable"
  appearances: number[]
  periods: number[]
}

export default function TrendCycleAnalysis({ data }: TrendCycleAnalysisProps) {
  const [analysisType, setAnalysisType] = useState("front")
  const [selectedNumber, setSelectedNumber] = useState<string>(analysisType === "front" ? "1" : "1")
  const [periodLength, setPeriodLength] = useState("50")

  // 当分析类型改变时，重置选中的号码
  const handleAnalysisTypeChange = (value: string) => {
    setAnalysisType(value)
    setSelectedNumber(value === "front" ? "1" : "1")
  }

  // 计算号码的出现趋势
  const numberTrends = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    const maxNumber = analysisType === "front" ? 35 : 12
    const trends: NumberTrend[] = []

    // 初始化每个号码的趋势数据
    for (let num = 1; num <= maxNumber; num++) {
      trends.push({
        number: num,
        lastAppearance: 0,
        cycleLength: null,
        trend: "stable",
        appearances: [],
        periods: [],
      })
    }

    // 分析每期数据
    const limitedData = data.slice(0, Number(periodLength))

    for (let i = 0; i < limitedData.length; i++) {
      const draw = limitedData[i]
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers

      if (!numbers || !Array.isArray(numbers)) continue

      // 记录每个号码的出现情况
      for (let num = 1; num <= maxNumber; num++) {
        const appeared = numbers.includes(num)

        if (appeared) {
          const trend = trends[num - 1]
          trend.appearances.push(i)

          // 计算与上次出现的间隔
          if (trend.appearances.length > 1) {
            const lastIdx = trend.appearances.length - 1
            const gap = trend.appearances[lastIdx] - trend.appearances[lastIdx - 1]
            trend.periods.push(gap)
          }

          trend.lastAppearance = i
        }
      }
    }

    // 计算周期和趋势
    for (const trend of trends) {
      // 计算平均周期
      if (trend.periods.length > 0) {
        const sum = trend.periods.reduce((a, b) => a + b, 0)
        trend.cycleLength = Math.round(sum / trend.periods.length)
      }

      // 判断趋势
      if (trend.appearances.length >= 2) {
        const recentGaps = trend.periods.slice(-3)
        if (recentGaps.length >= 2) {
          // 如果最近的间隔在缩短，说明趋势上升
          if (recentGaps[recentGaps.length - 1] < recentGaps[recentGaps.length - 2]) {
            trend.trend = "rising"
          }
          // 如果最近的间隔在增加，说明趋势下降
          else if (recentGaps[recentGaps.length - 1] > recentGaps[recentGaps.length - 2]) {
            trend.trend = "falling"
          }
        }
      }
    }

    return trends
  }, [data, analysisType, periodLength])

  // 为选中的号码生成图表数据
  const chartData = useMemo(() => {
    if (!selectedNumber || numberTrends.length === 0) return []

    const numIndex = Number.parseInt(selectedNumber) - 1
    if (numIndex < 0 || numIndex >= numberTrends.length) return []

    const trend = numberTrends[numIndex]
    const result = []

    // 生成移动平均线数据
    const windowSize = 3 // 移动平均窗口大小

    // 如果周期数据不足，直接返回原始数据
    if (trend.periods.length < windowSize) {
      for (let i = 0; i < trend.periods.length; i++) {
        result.push({
          index: i + 1,
          gap: trend.periods[i],
          ma: null,
        })
      }
      return result
    }

    // 计算移动平均
    for (let i = 0; i < trend.periods.length; i++) {
      if (i < windowSize - 1) {
        // 前几个点没有足够的历史数据计算移动平均
        result.push({
          index: i + 1,
          gap: trend.periods[i],
          ma: null,
        })
      } else {
        // 计算移动平均
        let sum = 0
        for (let j = 0; j < windowSize; j++) {
          sum += trend.periods[i - j]
        }
        result.push({
          index: i + 1,
          gap: trend.periods[i],
          ma: sum / windowSize,
        })
      }
    }

    return result
  }, [selectedNumber, numberTrends])

  // 生成号码选择器的选项
  const numberOptions = useMemo(() => {
    const maxNumber = analysisType === "front" ? 35 : 12
    return Array.from({ length: maxNumber }, (_, i) => i + 1)
  }, [analysisType])

  // 获取选中号码的趋势数据
  const selectedTrend = useMemo(() => {
    if (!selectedNumber || numberTrends.length === 0) return null
    const numIndex = Number.parseInt(selectedNumber) - 1
    if (numIndex < 0 || numIndex >= numberTrends.length) return null
    return numberTrends[numIndex]
  }, [selectedNumber, numberTrends])

  // 预测下一期可能性
  const prediction = useMemo(() => {
    if (!selectedTrend) return { probability: "未知", reason: "数据不足" }

    // 基于周期和趋势进行简单预测
    if (selectedTrend.appearances.length === 0) {
      return { probability: "中", reason: "该号码在分析周期内未出现过" }
    }

    const lastAppearance = selectedTrend.lastAppearance
    const periodLengthValue = Number.parseInt(periodLength)
    const sinceLastAppearance = periodLengthValue - lastAppearance - 1

    if (!selectedTrend.cycleLength) {
      return { probability: "低", reason: "数据不足以计算周期" }
    }

    // 如果距离上次出现的期数接近平均周期，则可能性增加
    const cycleDiff = Math.abs(sinceLastAppearance - selectedTrend.cycleLength!)
    const cycleRatio = cycleDiff / selectedTrend.cycleLength!

    if (cycleRatio <= 0.2) {
      return {
        probability: "高",
        reason: `距上次出现已${sinceLastAppearance}期，接近平均周期${selectedTrend.cycleLength}期`,
      }
    } else if (cycleRatio <= 0.5) {
      return {
        probability: "中",
        reason: `距上次出现已${sinceLastAppearance}期，与平均周期${selectedTrend.cycleLength}期有一定差距`,
      }
    } else {
      return {
        probability: "低",
        reason: `距上次出现已${sinceLastAppearance}期，与平均周期${selectedTrend.cycleLength}期差距较大`,
      }
    }
  }, [selectedTrend, periodLength])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={analysisType} onValueChange={handleAnalysisTypeChange}>
          <TabsList>
            <TabsTrigger value="front">前区号码</TabsTrigger>
            <TabsTrigger value="back">后区号码</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Select value={periodLength} onValueChange={setPeriodLength}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="分析期数" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">最近30期</SelectItem>
              <SelectItem value="50">最近50期</SelectItem>
              <SelectItem value="100">最近100期</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedNumber} onValueChange={setSelectedNumber}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择号码" />
            </SelectTrigger>
            <SelectContent>
              {numberOptions.map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}号球
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>号码{selectedNumber}走势周期分析</CardTitle>
          <CardDescription>分析号码的出现周期和趋势，预测下一期可能性</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedTrend?.cycleLength || "未知"}</div>
                  <div className="text-sm text-muted-foreground">平均周期(期)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {selectedTrend?.trend === "rising" ? "上升" : selectedTrend?.trend === "falling" ? "下降" : "稳定"}
                  </div>
                  <div className="text-sm text-muted-foreground">当前趋势</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      prediction.probability === "高"
                        ? "text-green-600"
                        : prediction.probability === "中"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {prediction.probability}
                  </div>
                  <div className="text-sm text-muted-foreground">下期可能性</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 ? (
            <div className="h-80">
              <ChartContainer
                config={{
                  gap: {
                    label: "间隔期数",
                    color: "hsl(var(--chart-1))",
                  },
                  ma: {
                    label: "移动平均",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: "出现次序", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "间隔期数", angle: -90, position: "insideLeft" }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="gap" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="ma" stroke="hsl(var(--chart-2))" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">该号码在分析周期内出现次数不足，无法生成图表</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-muted-foreground mb-2">{prediction.reason}</p>
                <p className="text-sm text-muted-foreground">
                  周期分析通过计算号码出现的间隔期数，识别潜在的周期性规律。图表中的蓝线表示实际间隔，虚线表示移动平均趋势。
                  当号码接近其平均周期时，出现概率会相对增加。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
