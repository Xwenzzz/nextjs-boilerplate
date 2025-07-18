"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface TailNumberAnalysisProps {
  data: LotteryDraw[]
}

interface TailData {
  tail: number
  count: number
  percentage: number
}

interface TailPattern {
  name: string
  description: string
  count: number
  percentage: number
  examples: string[]
}

export default function TailNumberAnalysis({ data }: TailNumberAnalysisProps) {
  const [analysisType, setAnalysisType] = useState("front")

  // 计算尾数分布
  const tailDistribution = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        tail: i,
        count: 0,
        percentage: 0,
      }))
    }

    const tailCounts: Record<number, number> = {}

    // 初始化所有可能的尾数(0-9)
    for (let i = 0; i < 10; i++) {
      tailCounts[i] = 0
    }

    // 统计每个尾数的出现次数
    let totalNumbers = 0
    data.forEach((draw) => {
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers
      if (numbers && Array.isArray(numbers)) {
        totalNumbers += numbers.length
        numbers.forEach((num) => {
          const tail = num % 10
          tailCounts[tail] = (tailCounts[tail] || 0) + 1
        })
      }
    })

    // 转换为数组
    const result: TailData[] = Object.entries(tailCounts).map(([tail, count]) => ({
      tail: Number.parseInt(tail),
      count,
      percentage: totalNumbers > 0 ? (count / totalNumbers) * 100 : 0,
    }))

    return result.sort((a, b) => a.tail - b.tail)
  }, [data, analysisType])

  // 分析尾数组合模式
  const tailPatterns = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    const patterns: Record<string, { count: number; examples: string[] }> = {
      sameTail: { count: 0, examples: [] },
      consecutiveTail: { count: 0, examples: [] },
      evenOddBalance: { count: 0, examples: [] },
      allEven: { count: 0, examples: [] },
      allOdd: { count: 0, examples: [] },
      highLowBalance: { count: 0, examples: [] },
    }

    data.forEach((draw) => {
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers
      if (!numbers || !Array.isArray(numbers) || numbers.length === 0) return

      const tails = numbers.map((num) => num % 10)
      const sortedTails = [...tails].sort((a, b) => a - b)
      const tailsStr = sortedTails.join(",")

      // 检查是否有相同尾数
      const uniqueTails = new Set(tails)
      if (uniqueTails.size < tails.length) {
        patterns.sameTail.count++
        if (patterns.sameTail.examples.length < 3) {
          patterns.sameTail.examples.push(tailsStr)
        }
      }

      // 检查是否有连续尾数
      let hasConsecutive = false
      for (let i = 0; i < sortedTails.length - 1; i++) {
        if (sortedTails[i] + 1 === sortedTails[i + 1] || (sortedTails[i] === 9 && sortedTails[i + 1] === 0)) {
          hasConsecutive = true
          break
        }
      }

      if (hasConsecutive) {
        patterns.consecutiveTail.count++
        if (patterns.consecutiveTail.examples.length < 3) {
          patterns.consecutiveTail.examples.push(tailsStr)
        }
      }

      // 检查奇偶平衡
      const oddTails = tails.filter((t) => t % 2 === 1).length
      const evenTails = tails.length - oddTails

      if (Math.abs(oddTails - evenTails) <= 1) {
        patterns.evenOddBalance.count++
        if (patterns.evenOddBalance.examples.length < 3) {
          patterns.evenOddBalance.examples.push(tailsStr)
        }
      }

      // 检查全偶
      if (evenTails === tails.length) {
        patterns.allEven.count++
        if (patterns.allEven.examples.length < 3) {
          patterns.allEven.examples.push(tailsStr)
        }
      }

      // 检查全奇
      if (oddTails === tails.length) {
        patterns.allOdd.count++
        if (patterns.allOdd.examples.length < 3) {
          patterns.allOdd.examples.push(tailsStr)
        }
      }

      // 检查高低平衡 (0-4为低，5-9为高)
      const lowTails = tails.filter((t) => t < 5).length
      const highTails = tails.length - lowTails

      if (Math.abs(lowTails - highTails) <= 1) {
        patterns.highLowBalance.count++
        if (patterns.highLowBalance.examples.length < 3) {
          patterns.highLowBalance.examples.push(tailsStr)
        }
      }
    })

    // 计算百分比并转换为数组
    const totalDraws = data.length
    const result: TailPattern[] = [
      {
        name: "同尾号",
        description: "包含至少两个相同尾数的组合",
        count: patterns.sameTail.count,
        percentage: totalDraws > 0 ? (patterns.sameTail.count / totalDraws) * 100 : 0,
        examples: patterns.sameTail.examples,
      },
      {
        name: "连号尾",
        description: "包含至少一对连续尾数的组合",
        count: patterns.consecutiveTail.count,
        percentage: totalDraws > 0 ? (patterns.consecutiveTail.count / totalDraws) * 100 : 0,
        examples: patterns.consecutiveTail.examples,
      },
      {
        name: "奇偶尾平衡",
        description: "奇偶尾数比例接近1:1的组合",
        count: patterns.evenOddBalance.count,
        percentage: totalDraws > 0 ? (patterns.evenOddBalance.count / totalDraws) * 100 : 0,
        examples: patterns.evenOddBalance.examples,
      },
      {
        name: "全偶尾",
        description: "所有号码尾数都是偶数的组合",
        count: patterns.allEven.count,
        percentage: totalDraws > 0 ? (patterns.allEven.count / totalDraws) * 100 : 0,
        examples: patterns.allEven.examples,
      },
      {
        name: "全奇尾",
        description: "所有号码尾数都是奇数的组合",
        count: patterns.allOdd.count,
        percentage: totalDraws > 0 ? (patterns.allOdd.count / totalDraws) * 100 : 0,
        examples: patterns.allOdd.examples,
      },
      {
        name: "高低尾平衡",
        description: "高尾数(5-9)和低尾数(0-4)比例接近1:1的组合",
        count: patterns.highLowBalance.count,
        percentage: totalDraws > 0 ? (patterns.highLowBalance.count / totalDraws) * 100 : 0,
        examples: patterns.highLowBalance.examples,
      },
    ]

    return result.sort((a, b) => b.percentage - a.percentage)
  }, [data, analysisType])

  // 为饼图准备颜色
  const COLORS = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FFCD56",
    "#C9CBCF",
    "#7BC225",
    "#B56DB4",
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Tabs value={analysisType} onValueChange={setAnalysisType}>
          <TabsList>
            <TabsTrigger value="front">前区号码</TabsTrigger>
            <TabsTrigger value="back">后区号码</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>尾数分布分析</CardTitle>
          <CardDescription>分析号码尾数(个位数)的分布规律和组合模式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">尾数分布</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tailDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="tail"
                      label={({ tail, percentage }) => `${tail}: ${percentage.toFixed(1)}%`}
                    >
                      {tailDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} (${((value / tailDistribution.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%)`,
                        `尾数${name}`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">尾数组合模式</h3>
              <div className="space-y-3">
                {tailPatterns.map((pattern) => (
                  <div key={pattern.name} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{pattern.name}</h4>
                      <Badge variant="outline">{pattern.percentage.toFixed(1)}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                    {pattern.examples.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">示例: </span>
                        {pattern.examples.map((ex, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 ml-1">
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">分析说明</h4>
                <p className="text-sm text-muted-foreground">
                  尾数分析是通过研究号码个位数的分布规律，发现潜在的选号策略。历史数据表明，某些尾数组合模式
                  （如同尾号、连号尾、奇偶尾平衡等）在开奖中出现频率较高。选号时可以参考这些高频模式，
                  提高选号的科学性。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
