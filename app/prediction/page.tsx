"use client"

import { useState, useEffect } from "react"
import PredictionEvaluation from "@/components/prediction-evaluation"
import { getLocalStorageData } from "@/lib/api"
import type { LotteryDraw } from "@/types/lottery"

export default function PredictionPage() {
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
      <h1 className="text-2xl font-bold mb-6">预测评估与自主学习</h1>
      <PredictionEvaluation data={lotteryData} />
    </main>
  )
}
