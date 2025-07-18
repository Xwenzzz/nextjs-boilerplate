"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { saveToLocalStorage, getLocalStorageData } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { LotteryDraw } from "@/types/lottery"

export default function QueryPage() {
  const [issueno, setIssueno] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LotteryDraw | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleQuery = async () => {
    if (!issueno.trim()) {
      toast({
        title: "请输入期号",
        description: "期号不能为空",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // 尝试从本地存储中查找
      const localData = getLocalStorageData() || []
      const localMatch = localData.find((draw) => draw.drawNumber === issueno.trim())

      if (localMatch) {
        // 如果本地找到了匹配的期号
        setResult(localMatch)
        toast({
          title: "查询成功",
          description: `已从本地数据中找到期号 ${issueno} 的开奖数据`,
        })
        setIsLoading(false)
        return
      }

      // 如果本地没有找到，尝试从API获取
      const timestamp = Date.now()
      const response = await fetch(`/api/lottery/${issueno.trim()}?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "查询失败")
      }

      // 检查返回的数据是否有效
      if (!data.data || !data.data.drawNumber) {
        throw new Error("未找到该期号的开奖数据")
      }

      setResult(data.data)

      // 保存到本地存储
      if (data.data) {
        // 检查是否已存在该期数据
        if (!localMatch) {
          // 如果不存在，添加到现有数据中
          localData.unshift(data.data)
          saveToLocalStorage(localData)
        }

        toast({
          title: "查询成功",
          description: `已获取期号 ${issueno} 的开奖数据`,
        })
      }
    } catch (error) {
      console.error("查询失败", error)
      setError(error instanceof Error ? error.message : "查询失败，请稍后再试")
      toast({
        title: "查询失败",
        description: error instanceof Error ? error.message : "查询失败，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>期号查询</CardTitle>
          <CardDescription>输入期号查询特定期的开奖结果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="issueno">期号</Label>
                <Input
                  id="issueno"
                  placeholder="例如: 23001"
                  value={issueno}
                  onChange={(e) => setIssueno(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleQuery} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  查询
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {result && (
              <div className="border rounded-md p-4 mt-4">
                <h3 className="font-medium mb-2">查询结果</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">期号:</span>
                    <span className="font-medium">{result.drawNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">开奖日期:</span>
                    <span className="font-medium">{result.drawDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">前区号码:</span>
                    <div className="flex space-x-1">
                      {result.frontNumbers.map((num) => (
                        <div
                          key={`front-${num}`}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">后区号码:</span>
                    <div className="flex space-x-1">
                      {result.backNumbers.map((num) => (
                        <div
                          key={`back-${num}`}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">奖金:</span>
                    <span className="font-medium">{formatCurrency(result.prize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">销售额:</span>
                    <span className="font-medium">{formatCurrency(result.sales)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              {result && (
                <Button
                  onClick={() => {
                    window.location.href = "/"
                  }}
                >
                  返回主页
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
