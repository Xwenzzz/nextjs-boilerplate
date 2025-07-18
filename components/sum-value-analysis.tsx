"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface SumValueAnalysisProps {
  data: LotteryDraw[]
}

interface SumRange {
  range: string
  count: number
  percentage: number
  isRecommended: boolean
}

export default function SumValueAnalysis({ data }: SumValueAnalysisProps) {
  // 计算前区号码的和值分布
  const sumValueData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        ranges: [],
        averageSum: 0,
        minSum: 0,
        maxSum: 0,
        recommendedRange: { min: 0, max: 0 },
        mostFrequentRange: { range: "", count: 0, percentage: 0 },
      }
    }

    // 计算每期前区号码的和值
    const sums = data
      .map((draw) => {
        if (!draw.frontNumbers || !Array.isArray(draw.frontNumbers)) return 0
        return draw.frontNumbers.reduce((sum, num) => sum + num, 0)
      })
      .filter((sum) => sum > 0)

    // 计算和值的基本统计信息
    const minSum = Math.min(...sums)
    const maxSum = Math.max(...sums)
    const averageSum = Math.round(sums.reduce((acc, val) => acc + val, 0) / sums.length)

    // 定义和值区间（每10个一组）
    const rangeSize = 10
    const rangeStart = Math.floor(minSum / rangeSize) * rangeSize
    const rangeEnd = Math.ceil(maxSum / rangeSize) * rangeSize

    // 统计每个区间的频率
    const rangeCounts: Record<string, number> = {}

    for (let i = rangeStart; i < rangeEnd; i += rangeSize) {
      const rangeKey = `${i}-${i + rangeSize - 1}`
      rangeCounts[rangeKey] = 0
    }

    sums.forEach((sum) => {
      const rangeIndex = Math.floor(sum / rangeSize)
      const rangeKey = `${rangeIndex * rangeSize}-${rangeIndex * rangeSize + rangeSize - 1}`
      rangeCounts[rangeKey] = (rangeCounts[rangeKey] || 0) + 1
    })

    // 转换为数组并计算百分比
    const ranges: SumRange[] = Object.entries(rangeCounts).map(([range, count]) => ({
      range,
      count,
      percentage: (count / sums.length) * 100,
      isRecommended: false,
    }))

    // 找出出现频率最高的区间
    const mostFrequentRange = ranges.reduce((prev, current) => (current.count > prev.count ? current : prev), ranges[0])

    // 确定推荐区间（通常是平均值附近的区间）
    const recommendedMin = Math.max(averageSum - 15, minSum)
    const recommendedMax = Math.min(averageSum + 15, maxSum)

    // 标记推荐区间
    ranges.forEach((range) => {
      const [start, end] = range.range.split("-").map(Number)
      if (start <= recommendedMax && end >= recommendedMin) {
        range.isRecommended = true
      }
    })

    return {
      ranges: ranges.sort((a, b) => {
        const [aStart] = a.range.split("-").map(Number)
        const [bStart] = b.range.split("-").map(Number)
        return aStart - bStart
      }),
      averageSum,
      minSum,
      maxSum,
      recommendedRange: { min: recommendedMin, max: recommendedMax },
      mostFrequentRange,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>前区和值分析</CardTitle>
          <CardDescription>分析前区5个号码的和值分布，找出最佳和值区间</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sumValueData.averageSum}</div>
                  <div className="text-sm text-muted-foreground">平均和值</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sumValueData.minSum} - {sumValueData.maxSum}
                  </div>
                  <div className="text-sm text-muted-foreground">和值范围</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {sumValueData.recommendedRange.min} - {sumValueData.recommendedRange.max}
                  </div>
                  <div className="text-sm text-muted-foreground">推荐和值区间</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sumValueData.mostFrequentRange?.range || "未知"}</div>
                  <div className="text-sm text-muted-foreground">最常见和值区间</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-80">
            <ChartContainer
              config={{
                count: {
                  label: "出现次数",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sumValueData.ranges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                    // 推荐区间使用不同颜色
                    isAnimationActive={false}
                    shape={(props: any) => {
                      const { x, y, width, height, isRecommended } = props
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={props.isRecommended ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
                          radius={[4, 4, 0, 0]}
                        />
                      )
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">推荐和值区间</h3>
            <div className="flex flex-wrap gap-2">
              {sumValueData.ranges
                .filter((range) => range.isRecommended)
                .map((range) => (
                  <Badge key={range.range} variant="secondary" className="text-sm py-1">
                    {range.range} ({range.percentage.toFixed(1)}%)
                  </Badge>
                ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-muted-foreground">
                  和值分析是通过计算前区5个号码的总和，找出历史开奖中最常出现的和值区间。
                  图表中的绿色柱表示推荐的和值区间，这些区间在历史数据中出现频率较高。
                  选择号码组合时，可以优先考虑和值在推荐区间内的组合，提高中奖概率。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
