// 完全重写余数分析组件，修复渲染问题
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Info } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface RemainderAnalysisProps {
  data: LotteryDraw[]
}

export default function RemainderAnalysis({ data }: RemainderAnalysisProps) {
  const [divisor, setDivisor] = useState("3")
  const [analysisType, setAnalysisType] = useState("front")

  const remainderData = useMemo(() => {
    // 确保数据存在
    if (!data || data.length === 0) {
      const div = Number.parseInt(divisor)
      return Array.from({ length: div }, (_, i) => ({
        remainder: i,
        count: 0,
        percentage: 0,
      }))
    }

    const div = Number.parseInt(divisor)
    const remainderCounts = {}

    // 初始化所有可能的余数
    for (let i = 0; i < div; i++) {
      remainderCounts[i] = 0
    }

    // 统计每个余数的出现次数
    let totalNumbers = 0
    data.forEach((draw) => {
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers
      if (numbers && Array.isArray(numbers)) {
        totalNumbers += numbers.length
        numbers.forEach((num) => {
          const remainder = num % div
          remainderCounts[remainder] = (remainderCounts[remainder] || 0) + 1
        })
      }
    })

    // 转换为数组
    const result = []
    for (let i = 0; i < div; i++) {
      result.push({
        remainder: i,
        count: remainderCounts[i] || 0,
        percentage: totalNumbers > 0 ? ((remainderCounts[i] || 0) / totalNumbers) * 100 : 0,
      })
    }

    return result
  }, [data, divisor, analysisType])

  // 为饼图准备颜色
  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <ToggleGroup
          type="single"
          value={analysisType}
          onValueChange={(value) => value && setAnalysisType(value)}
          className="mb-2 sm:mb-0"
        >
          <ToggleGroupItem value="front" className="text-xs sm:text-sm">
            前区号码
          </ToggleGroupItem>
          <ToggleGroupItem value="back" className="text-xs sm:text-sm">
            后区号码
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup type="single" value={divisor} onValueChange={(value) => value && setDivisor(value)}>
          <ToggleGroupItem value="3" className="text-xs sm:text-sm">
            除3余数
          </ToggleGroupItem>
          <ToggleGroupItem value="4" className="text-xs sm:text-sm">
            除4余数
          </ToggleGroupItem>
          <ToggleGroupItem value="5" className="text-xs sm:text-sm">
            除5余数
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>除{divisor}余数分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={remainderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ remainder, percentage }) => `余${remainder}: ${percentage.toFixed(1)}%`}
                  >
                    {remainderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} (${props.payload.percentage.toFixed(1)}%)`,
                      `除${divisor}余${props.payload.remainder}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">余数</th>
                    <th className="text-right">出现次数</th>
                    <th className="text-right">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {remainderData.map((item) => (
                    <tr key={item.remainder} className="border-b">
                      <td className="py-2">
                        除{divisor}余{item.remainder}
                      </td>
                      <td className="text-right">{item.count}</td>
                      <td className="text-right">{item.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                  <div>
                    <h4 className="font-medium mb-2">分析说明</h4>
                    <p className="text-sm text-muted-foreground">
                      余数分析是通过将号码除以特定数值（如3、4、5等）后得到的余数分布情况，可以帮助分析号码的周期性规律。
                      理论上，各个余数的出现概率应该接近均匀分布，若某个余数明显偏离平均值，可能意味着短期内出现调整的可能。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
