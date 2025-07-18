"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VerificationPanel from "@/components/verification-panel"
import RuleVerification from "@/components/rule-verification"
import { getLocalStorageData } from "@/lib/api"
import type { LotteryDraw } from "@/types/lottery"

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState("rules")
  const [historyData, setHistoryData] = useState<LotteryDraw[]>([])

  // 示例选号
  const [selectedNumbers, setSelectedNumbers] = useState({
    frontNumbers: [5, 12, 18, 23, 31],
    backNumbers: [2, 9],
  })

  // 在组件挂载时从本地存储加载历史数据
  useState(() => {
    const data = getLocalStorageData()
    if (data && data.length > 0) {
      setHistoryData(data)
    }
  })

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">号码验证系统</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="rules" className="text-xs sm:text-sm">
            验证规则配置
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-xs sm:text-sm">
            号码验证
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <VerificationPanel />
        </TabsContent>

        <TabsContent value="verify">
          <RuleVerification selectedNumbers={selectedNumbers} historyData={historyData} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
