"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TrendCycleAnalysis from "@/components/trend-cycle-analysis"
import SumValueAnalysis from "@/components/sum-value-analysis"
import TailNumberAnalysis from "@/components/tail-number-analysis"
import AdjacentRepeatAnalysis from "@/components/adjacent-repeat-analysis"
import AdvancedRatioAnalysis from "@/components/advanced-ratio-analysis"
import MachineLearningAnalysis from "@/components/machine-learning-analysis"
import ExclusionStrategies from "@/components/exclusion-strategies"
import AdvancedMathModels from "@/components/advanced-math-models"
import { getLocalStorageData } from "@/lib/api"
import type { LotteryDraw } from "@/types/lottery"

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("trend")
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([])

  // 在组件挂载时从本地存储加载历史数据
  useEffect(() => {
    const data = getLocalStorageData()
    if (data && data.length > 0) {
      setLotteryData(data)
    }
  }, [])

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">高级数据分析</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 mb-6 overflow-x-auto text-xs sm:text-sm">
          <TabsTrigger value="trend">周期分析</TabsTrigger>
          <TabsTrigger value="sum">和值分析</TabsTrigger>
          <TabsTrigger value="tail">尾数分析</TabsTrigger>
          <TabsTrigger value="adjacent">斜连重号</TabsTrigger>
          <TabsTrigger value="ratio">比例分析</TabsTrigger>
          <TabsTrigger value="ml">智能预测</TabsTrigger>
          <TabsTrigger value="exclusion">排除策略</TabsTrigger>
          <TabsTrigger value="math">高级数学</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <TrendCycleAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="sum">
          <SumValueAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="tail">
          <TailNumberAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="adjacent">
          <AdjacentRepeatAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="ratio">
          <AdvancedRatioAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="ml">
          <MachineLearningAnalysis data={lotteryData} />
        </TabsContent>

        <TabsContent value="exclusion">
          <ExclusionStrategies data={lotteryData} />
        </TabsContent>

        <TabsContent value="math">
          <AdvancedMathModels data={lotteryData} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
