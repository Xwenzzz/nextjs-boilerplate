"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getLocalStorageData } from "@/lib/api"
import ChaosTheoryAnalysis from "@/components/analysis/chaos-theory-analysis"
import QuantumEntropyAnalysis from "@/components/analysis/quantum-entropy-analysis"
import type { LotteryDraw } from "@/types/lottery"

export default function AdvancedAnalysisPage() {
  const [activeTab, setActiveTab] = useState("chaos")
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 在组件挂载时从本地存储加载历史数据
  useEffect(() => {
    const data = getLocalStorageData() || []
    setLotteryData(data)
    setIsLoading(false)
  }, [])

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">高级分析方法</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div className="animate-spin h-6 w-6 border-b-2 border-gray-600 rounded-full"></div>
            <span className="ml-3">加载数据中...</span>
          </CardContent>
        </Card>
      ) : lotteryData.length < 5 ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>数据不足</AlertTitle>
          <AlertDescription>高级分析需要至少5期历史数据。请先导入或获取更多的历史开奖数据。</AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="chaos">混沌理论分析</TabsTrigger>
            <TabsTrigger value="quantum">量子熵分析</TabsTrigger>
            <TabsTrigger value="astro">天文周期分析</TabsTrigger>
            <TabsTrigger value="financial">金融市场关联</TabsTrigger>
          </TabsList>

          <TabsContent value="chaos">
            <ChaosTheoryAnalysis data={lotteryData} />
          </TabsContent>

          <TabsContent value="quantum">
            <QuantumEntropyAnalysis data={lotteryData} />
          </TabsContent>

          <TabsContent value="astro">
            <Card>
              <CardHeader>
                <CardTitle>天文周期分析</CardTitle>
              </CardHeader>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">天文周期分析功能正在开发中，敬请期待</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>金融市场关联分析</CardTitle>
              </CardHeader>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">金融市场关联分析功能正在开发中，敬请期待</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
