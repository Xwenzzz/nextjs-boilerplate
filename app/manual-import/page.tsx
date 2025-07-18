"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { saveToLocalStorage, clearLocalStorage } from "@/lib/api"
import type { LotteryDraw } from "@/types/lottery"

export default function ManualImportPage() {
  const [drawNumber, setDrawNumber] = useState("")
  const [drawDate, setDrawDate] = useState("")
  const [frontNumbers, setFrontNumbers] = useState("")
  const [backNumbers, setBackNumbers] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 解析前区号码
      const parsedFrontNumbers = frontNumbers
        .split(/[,，\s]+/)
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n))

      // 解析后区号码
      const parsedBackNumbers = backNumbers
        .split(/[,，\s]+/)
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n))

      // 验证数据
      if (parsedFrontNumbers.length !== 5) {
        throw new Error("前区号码必须是5个不同的数字")
      }

      if (parsedBackNumbers.length !== 2) {
        throw new Error("后区号码必须是2个不同的数字")
      }

      // 创建新的开奖数据
      const newDraw: LotteryDraw = {
        drawNumber,
        drawDate,
        frontNumbers: parsedFrontNumbers,
        backNumbers: parsedBackNumbers,
        prize: "未知",
        sales: "未知",
      }

      // 清除旧数据
      clearLocalStorage()

      // 创建新的数据数组
      const newData = [newDraw]

      // 保存到本地存储
      saveToLocalStorage(newData)

      toast({
        title: "导入成功",
        description: "开奖数据已成功导入，正在返回主页",
      })

      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      toast({
        title: "导入失败",
        description: error instanceof Error ? error.message : "请检查输入数据格式",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>手动导入开奖数据</CardTitle>
          <CardDescription>输入最新的开奖号码，绕过API问题</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drawNumber">期号</Label>
                <Input
                  id="drawNumber"
                  placeholder="例如: 23001"
                  value={drawNumber}
                  onChange={(e) => setDrawNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawDate">开奖日期</Label>
                <Input
                  id="drawDate"
                  placeholder="例如: 2023-01-01"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frontNumbers">前区号码（5个，用逗号或空格分隔）</Label>
              <Input
                id="frontNumbers"
                placeholder="例如: 1, 2, 3, 4, 5"
                value={frontNumbers}
                onChange={(e) => setFrontNumbers(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">前区号码范围为1-35之间的5个不重复数字</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backNumbers">后区号码（2个，用逗号或空格分隔）</Label>
              <Input
                id="backNumbers"
                placeholder="例如: 6, 7"
                value={backNumbers}
                onChange={(e) => setBackNumbers(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">后区号码范围为1-12之间的2个不重复数字</p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                返回主页
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "导入中..." : "导入数据"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
