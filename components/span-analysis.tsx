"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { LotteryDraw, SpanData } from "@/types/lottery"

interface SpanAnalysisProps {
  data: LotteryDraw[]
}

export default function SpanAnalysis({ data }: SpanAnalysisProps) {
  // 计算前区号码的跨度（最大值减最小值）
  const spanData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    const spanCounts: Record<number, number> = {}

    // 计算每期的跨度
    data.forEach((draw) => {
      if (draw.frontNumbers && Array.isArray(draw.frontNumbers) && draw.frontNumbers.length > 0) {
        const frontNumbers = [...draw.frontNumbers]
        const min = Math.min(...frontNumbers)
        const max = Math.max(...frontNumbers)
        const span = max - min

        spanCounts[span] = (spanCounts[span] || 0) + 1
      }
    })

    // 转换为数组并排序
    const result: SpanData[] = Object.entries(spanCounts).map(([span, count]) => ({
      span: Number.parseInt(span),
      count,
      percentage: data.length > 0 ? (count / data.length) * 100 : 0,
    }))

    return result.sort((a, b) => a.span - b.span)
  }, [data])

  // 计算平均跨度
  const averageSpan = useMemo(() => {
    if (spanData.length === 0) return 0

    const totalSpan = spanData.reduce((sum, item) => sum + item.span * item.count, 0)
    const totalCount = spanData.reduce((sum, item) => sum + item.count, 0)

    return totalCount > 0 ? totalSpan / totalCount : 0
  }, [spanData])

  // 找出最常见的跨度
  const mostCommonSpan = useMemo(() => {
    if (spanData.length === 0) return null
    return spanData.reduce((prev, current) => (current.count > prev.count ? current : prev), spanData[0])
  }, [spanData])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>前区号码跨度分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{averageSpan.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">平均跨度</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{mostCommonSpan?.span || 0}</div>
                  <div className="text-sm text-muted-foreground">最常见跨度</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {mostCommonSpan ? mostCommonSpan.percentage.toFixed(2) + "%" : "0%"}
                  </div>
                  <div className="text-sm text-muted-foreground">最常见跨度出现率</div>
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
                <BarChart data={spanData}>
                  <XAxis dataKey="span" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
