"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface AdvancedRatioAnalysisProps {
  data: LotteryDraw[]
}

interface RatioData {
  name: string
  value: number
  percentage: number
}

interface RatioDistribution {
  ratio: string
  count: number
  percentage: number
  isRecommended: boolean
}

export default function AdvancedRatioAnalysis({ data }: AdvancedRatioAnalysisProps) {
  const [analysisType, setAnalysisType] = useState("front")
  const [ratioType, setRatioType] = useState("oddEven")

  // 计算奇偶比和大小比分布
  const ratioAnalysis = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        currentRatio: { odd: 0, even: 0, big: 0, small: 0 },
        oddEvenDistribution: [],
        bigSmallDistribution: [],
        oddEvenPieData: [],
        bigSmallPieData: [],
        recommendedOddEven: "",
        recommendedBigSmall: "",
      }
    }

    // 统计每期的奇偶比和大小比
    const oddEvenCounts: Record<string, number> = {}
    const bigSmallCounts: Record<string, number> = {}
    let totalOdd = 0
    let totalEven = 0
    let totalBig = 0
    let totalSmall = 0

    data.forEach((draw) => {
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers
      if (!numbers || !Array.isArray(numbers) || numbers.length === 0) return

      // 计算奇偶数量
      const oddCount = numbers.filter((num) => num % 2 === 1).length
      const evenCount = numbers.length - oddCount

      // 计算大小数量 (前区>18为大，后区>6为大)
      const threshold = analysisType === "front" ? 18 : 6
      const bigCount = numbers.filter((num) => num > threshold).length
      const smallCount = numbers.length - bigCount

      // 记录奇偶比
      const oddEvenRatio = `${oddCount}:${evenCount}`
      oddEvenCounts[oddEvenRatio] = (oddEvenCounts[oddEvenRatio] || 0) + 1

      // 记录大小比
      const bigSmallRatio = `${bigCount}:${smallCount}`
      bigSmallCounts[bigSmallRatio] = (bigSmallCounts[bigSmallRatio] || 0) + 1

      // 累计总数
      totalOdd += oddCount
      totalEven += evenCount
      totalBig += bigCount
      totalSmall += smallCount
    })

    // 计算总号码数
    const totalNumbers = data.length * (analysisType === "front" ? 5 : 2)

    // 转换为数组并计算百分比
    const oddEvenDistribution: RatioDistribution[] = Object.entries(oddEvenCounts).map(([ratio, count]) => ({
      ratio,
      count,
      percentage: (count / data.length) * 100,
      isRecommended: false,
    }))

    const bigSmallDistribution: RatioDistribution[] = Object.entries(bigSmallCounts).map(([ratio, count]) => ({
      ratio,
      count,
      percentage: (count / data.length) * 100,
      isRecommended: false,
    }))

    // 找出最常见的比例
    const topOddEven = oddEvenDistribution.sort((a, b) => b.percentage - a.percentage)[0]
    const topBigSmall = bigSmallDistribution.sort((a, b) => b.percentage - a.percentage)[0]

    // 标记推荐比例
    oddEvenDistribution.forEach((item) => {
      if (item.percentage >= topOddEven.percentage * 0.8) {
        item.isRecommended = true
      }
    })

    bigSmallDistribution.forEach((item) => {
      if (item.percentage >= topBigSmall.percentage * 0.8) {
        item.isRecommended = true
      }
    })

    // 准备饼图数据
    const oddEvenPieData: RatioData[] = [
      { name: "奇数", value: totalOdd, percentage: totalNumbers > 0 ? (totalOdd / totalNumbers) * 100 : 0 },
      { name: "偶数", value: totalEven, percentage: totalNumbers > 0 ? (totalEven / totalNumbers) * 100 : 0 },
    ]

    const bigSmallPieData: RatioData[] = [
      { name: "大号", value: totalBig, percentage: totalNumbers > 0 ? (totalBig / totalNumbers) * 100 : 0 },
      { name: "小号", value: totalSmall, percentage: totalNumbers > 0 ? (totalSmall / totalNumbers) * 100 : 0 },
    ]

    return {
      currentRatio: {
        odd: totalOdd,
        even: totalEven,
        big: totalBig,
        small: totalSmall,
      },
      oddEvenDistribution: oddEvenDistribution.sort((a, b) => b.percentage - a.percentage),
      bigSmallDistribution: bigSmallDistribution.sort((a, b) => b.percentage - a.percentage),
      oddEvenPieData,
      bigSmallPieData,
      recommendedOddEven: topOddEven?.ratio || "",
      recommendedBigSmall: topBigSmall?.ratio || "",
    }
  }, [data, analysisType])

  // 为饼图准备颜色
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]

  // 获取当前分析类型的分布数据
  const currentDistribution =
    ratioType === "oddEven" ? ratioAnalysis.oddEvenDistribution : ratioAnalysis.bigSmallDistribution

  // 获取当前分析类型的饼图数据
  const currentPieData = ratioType === "oddEven" ? ratioAnalysis.oddEvenPieData : ratioAnalysis.bigSmallPieData

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={analysisType} onValueChange={setAnalysisType}>
          <TabsList>
            <TabsTrigger value="front">前区号码</TabsTrigger>
            <TabsTrigger value="back">后区号码</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={ratioType} onValueChange={setRatioType}>
          <TabsList>
            <TabsTrigger value="oddEven">奇偶比</TabsTrigger>
            <TabsTrigger value="bigSmall">大小比</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ratioType === "oddEven" ? "奇偶比例分析" : "大小比例分析"}</CardTitle>
          <CardDescription>
            {ratioType === "oddEven"
              ? "分析号码中奇数和偶数的比例分布规律"
              : `分析号码中大号(${analysisType === "front" ? ">18" : ">6"})和小号的比例分布规律`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">总体分布</h3>
              <div className="h-80">
                <ChartContainer
                  config={{
                    value: {
                      label: "数量",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      >
                        {currentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} (${((value / currentPieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">比例分布</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>比例</TableHead>
                    <TableHead>出现次数</TableHead>
                    <TableHead>占比</TableHead>
                    <TableHead>推荐</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDistribution.slice(0, 8).map((item) => (
                    <TableRow key={item.ratio}>
                      <TableCell className="font-medium">{item.ratio}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                      <TableCell>{item.isRecommended && <Badge variant="secondary">推荐</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-muted-foreground">
                  {ratioType === "oddEven"
                    ? "奇偶比分析可以帮助我们了解奇数和偶数在开奖号码中的分布规律。历史数据显示，奇偶均衡的组合（如3:2或2:3）出现频率更高。选号时适当参考这些高频比例，可以提高选号的科学性。"
                    : "大小比分析可以帮助我们了解大号和小号在开奖号码中的分布规律。历史数据显示，大小均衡的组合出现频率更高。选号时适当参考这些高频比例，可以提高选号的科学性。"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  当前推荐比例：
                  {ratioType === "oddEven"
                    ? `奇偶比 ${ratioAnalysis.recommendedOddEven}`
                    : `大小比 ${ratioAnalysis.recommendedBigSmall}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
