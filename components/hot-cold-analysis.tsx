"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { LotteryDraw, NumberFrequency } from "@/types/lottery"

interface HotColdAnalysisProps {
  data: LotteryDraw[]
}

export default function HotColdAnalysis({ data }: HotColdAnalysisProps) {
  const [period, setPeriod] = useState("30")
  const [analysisType, setAnalysisType] = useState("front")

  const filteredData = useMemo(() => {
    const periodCount = Number.parseInt(period)
    return data.slice(0, periodCount)
  }, [data, period])

  const frequencyData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return []
    }

    const frequencies: Record<number, number> = {}
    const maxNumber = analysisType === "front" ? 35 : 12

    // 初始化所有可能的号码
    for (let i = 1; i <= maxNumber; i++) {
      frequencies[i] = 0
    }

    // 统计频率
    filteredData.forEach((draw) => {
      const numbers = analysisType === "front" ? draw.frontNumbers : draw.backNumbers
      if (numbers && Array.isArray(numbers)) {
        numbers.forEach((num) => {
          frequencies[num] = (frequencies[num] || 0) + 1
        })
      }
    })

    // 计算出现概率
    const totalDraws = filteredData.length
    const expectedFrequency =
      analysisType === "front"
        ? (totalDraws * 5) / maxNumber // 前区5个号码
        : (totalDraws * 2) / maxNumber // 后区2个号码

    // 转换为数组并排序
    const result: NumberFrequency[] = Object.entries(frequencies).map(([num, freq]) => ({
      number: Number.parseInt(num),
      frequency: freq,
      percentage: totalDraws > 0 ? (freq / totalDraws) * 100 : 0,
      isHot: freq > expectedFrequency, // 高于平均期望值为热号
    }))

    return result.sort((a, b) => b.frequency - a.frequency)
  }, [filteredData, analysisType])

  const hotNumbers = useMemo(() => {
    return frequencyData.filter((item) => item.isHot)
  }, [frequencyData])

  const coldNumbers = useMemo(() => {
    return frequencyData.filter((item) => !item.isHot).sort((a, b) => a.frequency - b.frequency)
  }, [frequencyData])

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

        <ToggleGroup type="single" value={period} onValueChange={(value) => value && setPeriod(value)}>
          <ToggleGroupItem value="10" className="text-xs sm:text-sm">
            最近10期
          </ToggleGroupItem>
          <ToggleGroupItem value="30" className="text-xs sm:text-sm">
            最近30期
          </ToggleGroupItem>
          <ToggleGroupItem value="50" className="text-xs sm:text-sm">
            最近50期
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Tabs defaultValue="hot">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hot" className="text-xs sm:text-sm">
            热号分析
          </TabsTrigger>
          <TabsTrigger value="cold" className="text-xs sm:text-sm">
            冷号分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hot">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">热号分析（出现频率高于平均值）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
                {hotNumbers.map((item) => (
                  <div key={item.number} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${analysisType === "front" ? "bg-red-500" : "bg-blue-500"} text-white flex items-center justify-center font-bold text-xs sm:text-sm`}
                    >
                      {item.number}
                    </div>
                    <div className="text-[10px] sm:text-xs mt-1 text-center">
                      <div>{item.frequency}次</div>
                      <div>{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cold">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">冷号分析（出现频率低于平均值）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
                {coldNumbers.map((item) => (
                  <div key={item.number} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${analysisType === "front" ? "border-red-500 text-red-500" : "border-blue-500 text-blue-500"} flex items-center justify-center font-bold text-xs sm:text-sm`}
                    >
                      {item.number}
                    </div>
                    <div className="text-[10px] sm:text-xs mt-1 text-center">
                      <div>{item.frequency}次</div>
                      <div>{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
