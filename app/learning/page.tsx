"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"
import { getLocalStorageData } from "@/lib/api"
import type { LotteryDraw } from "@/types/lottery"

// 动态导入自主学习分析组件，减少初始加载时间
const SelfLearningAnalysis = dynamic(() => import("@/components/self-learning-analysis"), {
  ssr: false,
  loading: () => <LoadingState />,
})

// 加载状态组件
const LoadingState = () => (
  <div className="space-y-4">
    <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded"></div>
    <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
    <div className="h-8 w-1/4 bg-gray-200 animate-pulse rounded"></div>
    <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
  </div>
)

const ErrorFallback = () => (
  <div className="container mx-auto py-6 px-4">
    <div className="p-6 border border-red-300 bg-red-50 rounded-md">
      <h2 className="text-xl font-bold text-red-800 mb-4">页面加载错误</h2>
      <p className="text-red-600 mb-4">自主分析学习系统加载过程中出现错误，请尝试以下操作：</p>
      <ol className="list-decimal pl-5 mb-4 text-red-600">
        <li>刷新页面</li>
        <li>清除浏览器缓存</li>
        <li>重新导入数据</li>
        <li>联系系统管理员</li>
      </ol>
      <Button onClick={() => window.history.back()} className="mr-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>
      <Button variant="destructive" onClick={() => window.location.reload()}>
        刷新页面
      </Button>
    </div>
  </div>
)

export default function LearningPage() {
  // Initialize with an empty array to avoid null/undefined
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // 修改 loadData 函数，确保更安全的数据处理
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // 获取本地存储数据
        let localData
        try {
          localData = getLocalStorageData()
        } catch (error) {
          console.error("获取本地存储数据时出错:", error)
          localData = []
        }
        // 确保 localData 是一个数组
        if (!Array.isArray(localData)) {
          console.warn("本地存储数据不是数组，使用空数组代替")
          localData = []
        }

        // 确保我们始终有一个有效的数组
        let validData: LotteryDraw[] = []

        if (Array.isArray(localData)) {
          // 验证数组中的每个项目是否具有所需的属性
          validData = localData.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              Array.isArray(item.frontNumbers) &&
              Array.isArray(item.backNumbers) &&
              item.frontNumbers.every((n) => typeof n === "number" && !isNaN(n)) &&
              item.backNumbers.every((n) => typeof n === "number" && !isNaN(n)),
          )
        }

        // 设置验证后的数据
        setLotteryData(validData)
        console.log("加载彩票数据:", validData.length, "项")
      } catch (error) {
        console.error("加载彩票数据时出错:", error)
        // 如果有任何错误，确保我们设置一个空数组
        setLotteryData([])
        setError(error instanceof Error ? error : new Error("未知错误"))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (error) {
    return <ErrorFallback />
  }

  return (
    <>
      {(() => {
        try {
          return (
            <main className="container mx-auto py-6 px-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">自主分析学习系统</h1>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Button>
              </div>

              {isLoading ? <LoadingState /> : <SelfLearningAnalysis data={lotteryData} />}
            </main>
          )
        } catch (error) {
          console.error("渲染学习页面时出错:", error)
          return <ErrorFallback />
        }
      })()}
    </>
  )
}
