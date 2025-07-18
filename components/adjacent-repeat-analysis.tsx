"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface AdjacentRepeatAnalysisProps {
  data: LotteryDraw[]
}

interface RepeatStats {
  type: string
  count: number
  percentage: number
  description: string
}

export default function AdjacentRepeatAnalysis({ data }: AdjacentRepeatAnalysisProps) {
  // 分析斜连号和重号
  const analysisResult = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        repeatStats: [],
        examples: [],
        countDistribution: [],
      }
    }

    // 只分析前区号码
    const repeatCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }
    const adjacentCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    const examples = []

    // 分析每一期与前一期的关系
    for (let i = 1; i < data.length; i++) {
      const currentDraw = data[i]
      const previousDraw = data[i - 1]

      if (!currentDraw.frontNumbers || !previousDraw.frontNumbers) continue

      // 检查重号
      const repeatNumbers = currentDraw.frontNumbers.filter((num) => previousDraw.frontNumbers.includes(num))

      // 检查斜连号 (相邻+1或-1)
      const adjacentNumbers = currentDraw.frontNumbers.filter(
        (num) => previousDraw.frontNumbers.includes(num + 1) || previousDraw.frontNumbers.includes(num - 1),
      )

      // 记录重号和斜连号的数量
      repeatCounts[repeatNumbers.length] = (repeatCounts[repeatNumbers.length] || 0) + 1
      adjacentCounts[adjacentNumbers.length] = (adjacentCounts[adjacentNumbers.length] || 0) + 1

      // 收集一些例子
      if (examples.length < 5 && (repeatNumbers.length > 0 || adjacentNumbers.length > 0)) {
        examples.push({
          currentPeriod: currentDraw.drawNumber,
          previousPeriod: previousDraw.drawNumber,
          currentNumbers: currentDraw.frontNumbers.join(","),
          previousNumbers: previousDraw.frontNumbers.join(","),
          repeatCount: repeatNumbers.length,
          repeatNumbers: repeatNumbers.join(","),
          adjacentCount: adjacentNumbers.length,
          adjacentNumbers: adjacentNumbers.join(","),
        })
      }
    }

    // 计算总期数
    const totalPeriods = data.length - 1

    // 统计重号和斜连号的分布
    const countDistribution = []
    for (let i = 0; i <= 5; i++) {
      countDistribution.push({
        count: i,
        repeat: repeatCounts[i] || 0,
        repeatPercentage: totalPeriods > 0 ? ((repeatCounts[i] || 0) / totalPeriods) * 100 : 0,
        adjacent: adjacentCounts[i] || 0,
        adjacentPercentage: totalPeriods > 0 ? ((adjacentCounts[i] || 0) / totalPeriods) * 100 : 0,
      })
    }

    // 计算重号和斜连号的统计信息
    const repeatStats: RepeatStats[] = [
      {
        type: "重号",
        count: Object.entries(repeatCounts).reduce((sum, [count, num]) => (count !== "0" ? sum + num : sum), 0),
        percentage:
          totalPeriods > 0
            ? (Object.entries(repeatCounts).reduce((sum, [count, num]) => (count !== "0" ? sum + num : sum), 0) /
                totalPeriods) *
              100
            : 0,
        description: "上期出现的号码在本期再次出现",
      },
      {
        type: "斜连号",
        count: Object.entries(adjacentCounts).reduce((sum, [count, num]) => (count !== "0" ? sum + num : sum), 0),
        percentage:
          totalPeriods > 0
            ? (Object.entries(adjacentCounts).reduce((sum, [count, num]) => (count !== "0" ? sum + num : sum), 0) /
                totalPeriods) *
              100
            : 0,
        description: "与上期号码相邻的号码(+1或-1)",
      },
      {
        type: "1个重号",
        count: repeatCounts[1] || 0,
        percentage: totalPeriods > 0 ? ((repeatCounts[1] || 0) / totalPeriods) * 100 : 0,
        description: "与上期有1个相同号码",
      },
      {
        type: "2个重号",
        count: repeatCounts[2] || 0,
        percentage: totalPeriods > 0 ? ((repeatCounts[2] || 0) / totalPeriods) * 100 : 0,
        description: "与上期有2个相同号码",
      },
      {
        type: "1-2个斜连号",
        count: (adjacentCounts[1] || 0) + (adjacentCounts[2] || 0),
        percentage: totalPeriods > 0 ? (((adjacentCounts[1] || 0) + (adjacentCounts[2] || 0)) / totalPeriods) * 100 : 0,
        description: "与上期有1-2个相邻号码",
      },
    ]

    return {
      repeatStats: repeatStats.sort((a, b) => b.percentage - a.percentage),
      examples,
      countDistribution,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>斜连号与重号分析</CardTitle>
          <CardDescription>分析相邻期次之间的号码关联性，包括重号和斜连号</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-4">统计概览</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>出现次数</TableHead>
                    <TableHead>出现概率</TableHead>
                    <TableHead>说明</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResult.repeatStats.map((stat) => (
                    <TableRow key={stat.type}>
                      <TableCell className="font-medium">{stat.type}</TableCell>
                      <TableCell>{stat.count}</TableCell>
                      <TableCell>
                        <Badge variant={stat.percentage > 50 ? "default" : "outline"}>
                          {stat.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{stat.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="font-medium mb-4">数量分布</h3>
              <div className="h-80">
                <ChartContainer
                  config={{
                    repeat: {
                      label: "重号",
                      color: "hsl(var(--chart-1))",
                    },
                    adjacent: {
                      label: "斜连号",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisResult.countDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="count" label={{ value: "数量", position: "insideBottom", offset: -5 }} />
                      <YAxis label={{ value: "期数", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="repeat" name="重号" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="adjacent" name="斜连号" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>

          {analysisResult.examples.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">实例分析</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>期号</TableHead>
                    <TableHead>本期号码</TableHead>
                    <TableHead>上期号码</TableHead>
                    <TableHead>重号</TableHead>
                    <TableHead>斜连号</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResult.examples.map((example, index) => (
                    <TableRow key={index}>
                      <TableCell>{example.currentPeriod}</TableCell>
                      <TableCell>{example.currentNumbers}</TableCell>
                      <TableCell>{example.previousNumbers}</TableCell>
                      <TableCell>
                        {example.repeatCount > 0 ? (
                          <span className="flex items-center">
                            <Badge variant="outline" className="mr-1">
                              {example.repeatCount}
                            </Badge>
                            {example.repeatNumbers}
                          </span>
                        ) : (
                          "无"
                        )}
                      </TableCell>
                      <TableCell>
                        {example.adjacentCount > 0 ? (
                          <span className="flex items-center">
                            <Badge variant="outline" className="mr-1">
                              {example.adjacentCount}
                            </Badge>
                            {example.adjacentNumbers}
                          </span>
                        ) : (
                          "无"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-muted-foreground">
                  斜连号与重号分析是研究相邻期次之间号码关联性的重要方法。数据统计表明，每期通常会出现1-2个重号或斜连号，
                  这一规律可以帮助我们在选号时有针对性地保留部分上期号码或其相邻号码，提高命中概率。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
