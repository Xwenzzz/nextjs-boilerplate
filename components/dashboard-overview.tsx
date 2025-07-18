"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Target, Zap, Brain, BarChart3 } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface DashboardOverviewProps {
  data: LotteryDraw[]
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const [realTimeStats, setRealTimeStats] = useState({
    hotNumbers: [] as number[],
    coldNumbers: [] as number[],
    trendScore: 0,
    predictionAccuracy: 0,
    lastUpdate: new Date(),
  })

  // 计算实时统计数据
  useEffect(() => {
    if (data.length === 0) return

    // 计算热门号码
    const numberFreq: Record<number, number> = {}
    data.slice(0, 20).forEach((draw) => {
      draw.frontNumbers.forEach((num) => {
        numberFreq[num] = (numberFreq[num] || 0) + 1
      })
    })

    const sortedNumbers = Object.entries(numberFreq)
      .map(([num, freq]) => ({ num: Number.parseInt(num), freq }))
      .sort((a, b) => b.freq - a.freq)

    const hotNumbers = sortedNumbers.slice(0, 5).map((item) => item.num)
    const coldNumbers = sortedNumbers.slice(-5).map((item) => item.num)

    // 计算趋势分数
    const recentTrend = calculateTrendScore(data.slice(0, 10))

    // 模拟预测准确率
    const accuracy = Math.min(95, 65 + Math.random() * 20)

    setRealTimeStats({
      hotNumbers,
      coldNumbers,
      trendScore: recentTrend,
      predictionAccuracy: accuracy,
      lastUpdate: new Date(),
    })
  }, [data])

  const calculateTrendScore = (recentData: LotteryDraw[]): number => {
    if (recentData.length < 5) return 50

    // 简化的趋势计算
    let score = 50
    const sums = recentData.map((draw) => draw.frontNumbers.reduce((sum, num) => sum + num, 0))

    // 检查和值趋势
    const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length
    if (avgSum > 90 && avgSum < 110) score += 20

    // 检查奇偶平衡
    const oddCounts = recentData.map((draw) => draw.frontNumbers.filter((num) => num % 2 === 1).length)
    const avgOdd = oddCounts.reduce((a, b) => a + b, 0) / oddCounts.length
    if (avgOdd > 2 && avgOdd < 3.5) score += 15

    return Math.min(100, score)
  }

  // 准备图表数据
  const trendData = data
    .slice(0, 15)
    .reverse()
    .map((draw, index) => ({
      period: draw.drawNumber.slice(-3),
      sum: draw.frontNumbers.reduce((sum, num) => sum + num, 0),
      span: Math.max(...draw.frontNumbers) - Math.min(...draw.frontNumbers),
      oddCount: draw.frontNumbers.filter((num) => num % 2 === 1).length,
    }))

  const distributionData = [
    { name: "小号区(1-12)", value: 0, color: "#8884d8" },
    { name: "中号区(13-23)", value: 0, color: "#82ca9d" },
    { name: "大号区(24-35)", value: 0, color: "#ffc658" },
  ]

  // 统计号码分布
  data.slice(0, 20).forEach((draw) => {
    draw.frontNumbers.forEach((num) => {
      if (num <= 12) distributionData[0].value++
      else if (num <= 23) distributionData[1].value++
      else distributionData[2].value++
    })
  })

  return (
    <div className="space-y-6">
      {/* 实时指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">趋势分析</p>
                <p className="text-2xl font-bold">{realTimeStats.trendScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-75" />
            </div>
            <Progress value={realTimeStats.trendScore} className="mt-2 bg-blue-400/30" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">预测准确率</p>
                <p className="text-2xl font-bold">{realTimeStats.predictionAccuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 opacity-75" />
            </div>
            <Progress value={realTimeStats.predictionAccuracy} className="mt-2 bg-green-400/30" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI分析强度</p>
                <p className="text-2xl font-bold">高级</p>
              </div>
              <Brain className="h-8 w-8 opacity-75" />
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-2 w-4 bg-purple-400/30 rounded">
                  <div className="h-full bg-white rounded" style={{ width: i <= 4 ? "100%" : "0%" }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">数据质量</p>
                <p className="text-2xl font-bold">优秀</p>
              </div>
              <BarChart3 className="h-8 w-8 opacity-75" />
            </div>
            <p className="text-xs text-orange-100 mt-2">最后更新: {realTimeStats.lastUpdate.toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* 热门冷门号码展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-red-500" />
              热门号码 (近20期)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {realTimeStats.hotNumbers.map((num, index) => (
                <div key={num} className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-bold shadow-lg">
                    {num}
                  </div>
                  {index === 0 && <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-xs px-1">最热</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-blue-500" />
              冷门号码 (近20期)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {realTimeStats.coldNumbers.map((num, index) => (
                <div key={num} className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center font-bold shadow-lg">
                    {num}
                  </div>
                  {index === 0 && <Badge className="absolute -top-2 -right-2 bg-blue-600 text-xs px-1">最冷</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>和值趋势分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[60, 140]} />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="sum" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="和值" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>号码分布统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 多维度分析 */}
      <Card>
        <CardHeader>
          <CardTitle>多维度趋势对比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" domain={[60, 140]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 35]} />
                  <ChartTooltip />
                  <Line yAxisId="left" type="monotone" dataKey="sum" stroke="#8884d8" strokeWidth={2} name="和值" />
                  <Line yAxisId="right" type="monotone" dataKey="span" stroke="#82ca9d" strokeWidth={2} name="跨度" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="oddCount"
                    stroke="#ffc658"
                    strokeWidth={2}
                    name="奇数个数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
