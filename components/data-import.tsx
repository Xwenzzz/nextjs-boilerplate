"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { saveToLocalStorage, batchImportData } from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

export default function DataImport({ onDataImported }: { onDataImported: (data: LotteryDraw[]) => void }) {
  const [csvData, setCsvData] = useState("")
  const [jsonData, setJsonData] = useState("")
  const [manualDrawNumber, setManualDrawNumber] = useState("")
  const [manualDrawDate, setManualDrawDate] = useState("")
  const [manualFrontNumbers, setManualFrontNumbers] = useState("")
  const [manualBackNumbers, setManualBackNumbers] = useState("")
  const [isBatchImporting, setIsBatchImporting] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const { toast } = useToast()

  // 处理CSV导入
  const handleCsvImport = () => {
    try {
      if (!csvData.trim()) {
        toast({
          title: "导入失败",
          description: "请输入CSV数据",
          variant: "destructive",
        })
        return
      }

      const lines = csvData.trim().split("\n")
      const data: LotteryDraw[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(",")
        if (parts.length < 9) {
          toast({
            title: "格式错误",
            description: `第${i + 1}行数据格式不正确，请检查`,
            variant: "destructive",
          })
          return
        }

        const drawNumber = parts[0].trim()
        const drawDate = parts[1].trim()
        const frontNumbers = parts
          .slice(2, 7)
          .map((n) => Number.parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n))
        const backNumbers = parts
          .slice(7, 9)
          .map((n) => Number.parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n))

        // 验证数据
        if (!validateLotteryData(drawNumber, drawDate, frontNumbers, backNumbers)) {
          toast({
            title: "数据验证失败",
            description: `第${i + 1}行数据不符合大乐透规则，请检查`,
            variant: "destructive",
          })
          return
        }

        data.push({
          drawNumber,
          drawDate,
          frontNumbers,
          backNumbers,
          prize: "未知",
          sales: "未知",
        })
      }

      if (data.length > 0) {
        saveToLocalStorage(data)
        onDataImported(data)
        toast({
          title: "导入成功",
          description: `成功导入${data.length}条开奖数据`,
        })
        setCsvData("")
      }
    } catch (error) {
      toast({
        title: "导入失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    }
  }

  // 处理JSON导入
  const handleJsonImport = () => {
    try {
      if (!jsonData.trim()) {
        toast({
          title: "导入失败",
          description: "请输入JSON数据",
          variant: "destructive",
        })
        return
      }

      const data = JSON.parse(jsonData)

      if (!Array.isArray(data)) {
        toast({
          title: "格式错误",
          description: "JSON数据必须是数组格式",
          variant: "destructive",
        })
        return
      }

      const validData: LotteryDraw[] = []

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!item || typeof item !== "object") continue

        const drawNumber = item.drawNumber || ""
        const drawDate = item.drawDate || ""
        const frontNumbers = Array.isArray(item.frontNumbers) ? item.frontNumbers : []
        const backNumbers = Array.isArray(item.backNumbers) ? item.backNumbers : []

        // 验证数据
        if (!validateLotteryData(drawNumber, drawDate, frontNumbers, backNumbers)) {
          toast({
            title: "数据验证失败",
            description: `第${i + 1}条数据不符合大乐透规则，请检查`,
            variant: "destructive",
          })
          return
        }

        validData.push({
          drawNumber,
          drawDate,
          frontNumbers,
          backNumbers,
          prize: item.prize || "未知",
          sales: item.sales || "未知",
        })
      }

      if (validData.length > 0) {
        saveToLocalStorage(validData)
        onDataImported(validData)
        toast({
          title: "导入成功",
          description: `成功导入${validData.length}条开奖数据`,
        })
        setJsonData("")
      }
    } catch (error) {
      toast({
        title: "导入失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    }
  }

  // 处理手动添加
  const handleManualAdd = () => {
    try {
      if (
        !manualDrawNumber.trim() ||
        !manualDrawDate.trim() ||
        !manualFrontNumbers.trim() ||
        !manualBackNumbers.trim()
      ) {
        toast({
          title: "添加失败",
          description: "请填写完整的开奖信息",
          variant: "destructive",
        })
        return
      }

      const frontNumbers = manualFrontNumbers
        .split(/[,，\s]+/)
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n))

      const backNumbers = manualBackNumbers
        .split(/[,，\s]+/)
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => !isNaN(n))

      // 验证数据
      if (!validateLotteryData(manualDrawNumber, manualDrawDate, frontNumbers, backNumbers)) {
        toast({
          title: "数据验证失败",
          description: "输入的数据不符合大乐透规则，请检查",
          variant: "destructive",
        })
        return
      }

      const newDraw: LotteryDraw = {
        drawNumber: manualDrawNumber,
        drawDate: manualDrawDate,
        frontNumbers,
        backNumbers,
        prize: "未知",
        sales: "未知",
      }

      // 获取现有数据
      const existingData = localStorage.getItem("lotteryData")
      const data = existingData ? JSON.parse(existingData) : []

      // 添加新数据
      data.unshift(newDraw)
      saveToLocalStorage(data)
      onDataImported(data)

      toast({
        title: "添加成功",
        description: `成功添加期号${manualDrawNumber}的开奖数据`,
      })

      // 清空表单
      setManualDrawNumber("")
      setManualDrawDate("")
      setManualFrontNumbers("")
      setManualBackNumbers("")
    } catch (error) {
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    }
  }

  // 批量导入数据
  const handleBatchImport = async () => {
    setIsBatchImporting(true)
    setBatchProgress(0)

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setBatchProgress((prev) => {
          const newProgress = prev + 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 500)

      // 执行批量导入
      const data = await batchImportData(10, 5)

      clearInterval(progressInterval)
      setBatchProgress(100)

      if (data.length > 0) {
        onDataImported(data)
        toast({
          title: "批量导入成功",
          description: `成功导入${data.length}条开奖数据`,
        })
      } else {
        toast({
          title: "批量导入失败",
          description: "未能获取到数据，请尝试其他导入方式",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "批量导入失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsBatchImporting(false)
        setBatchProgress(0)
      }, 500)
    }
  }

  // 验证彩票数据是否符合规则
  function validateLotteryData(
    drawNumber: string,
    drawDate: string,
    frontNumbers: number[],
    backNumbers: number[],
  ): boolean {
    // 检查期号和日期
    if (!drawNumber || !drawDate) return false

    // 检查前区号码
    if (!Array.isArray(frontNumbers) || frontNumbers.length !== 5) return false

    // 检查后区号码
    if (!Array.isArray(backNumbers) || backNumbers.length !== 2) return false

    // 检查前区号码是否在1-35范围内且不重复
    const frontSet = new Set(frontNumbers)
    if (frontSet.size !== 5) return false

    const validFront = frontNumbers.every((num) => num >= 1 && num <= 35)
    if (!validFront) return false

    // 检查后区号码是否在1-12范围内且不重复
    const backSet = new Set(backNumbers)
    if (backSet.size !== 2) return false

    const validBack = backNumbers.every((num) => num >= 1 && num <= 12)
    if (!validBack) return false

    // 检查前区和后区之间是否有重复
    const hasOverlap = frontNumbers.some((front) => backNumbers.includes(front))
    if (hasOverlap) return false

    return true
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>数据导入</CardTitle>
        <CardDescription>导入或手动添加大乐透历史开奖数据</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="batch">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="batch">批量导入</TabsTrigger>
            <TabsTrigger value="manual">手动添加</TabsTrigger>
            <TabsTrigger value="csv">CSV导入</TabsTrigger>
            <TabsTrigger value="json">JSON导入</TabsTrigger>
          </TabsList>

          <TabsContent value="batch">
            <div className="grid gap-4 py-4">
              <div className="text-sm text-muted-foreground mb-2">
                批量导入将自动从API获取最近50期的开奖数据，适用于首次使用或需要更新大量数据的情况。
              </div>

              {isBatchImporting ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>正在批量导入数据，请稍候...</span>
                  </div>
                  <Progress value={batchProgress} className="h-2" />
                </div>
              ) : (
                <Button onClick={handleBatchImport} className="bg-gradient-to-r from-blue-500 to-blue-600">
                  开始批量导入
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drawNumber">期号</Label>
                  <Input
                    id="drawNumber"
                    placeholder="例如: 23001"
                    value={manualDrawNumber}
                    onChange={(e) => setManualDrawNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="drawDate">开奖日期</Label>
                  <Input
                    id="drawDate"
                    placeholder="例如: 2023-01-01"
                    value={manualDrawDate}
                    onChange={(e) => setManualDrawDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="frontNumbers">前区号码（5个，用逗号或空格分隔）</Label>
                <Input
                  id="frontNumbers"
                  placeholder="例如: 1, 2, 3, 4, 5"
                  value={manualFrontNumbers}
                  onChange={(e) => setManualFrontNumbers(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="backNumbers">后区号码（2个，用逗号或空格分隔）</Label>
                <Input
                  id="backNumbers"
                  placeholder="例如: 6, 7"
                  value={manualBackNumbers}
                  onChange={(e) => setManualBackNumbers(e.target.value)}
                />
              </div>
              <Button onClick={handleManualAdd}>添加</Button>
            </div>
          </TabsContent>

          <TabsContent value="csv">
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="csvData">
                  CSV数据（每行一条记录，格式：期号,日期,前区号码1,前区号码2,前区号码3,前区号码4,前区号码5,后区号码1,后区号码2）
                </Label>
                <Textarea
                  id="csvData"
                  placeholder="例如: 23001,2023-01-01,1,2,3,4,5,6,7"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                />
              </div>
              <Button onClick={handleCsvImport}>导入</Button>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="jsonData">
                  JSON数据（数组格式，每个对象包含drawNumber, drawDate, frontNumbers, backNumbers字段）
                </Label>
                <Textarea
                  id="jsonData"
                  placeholder='例如: [{"drawNumber":"23001","drawDate":"2023-01-01","frontNumbers":[1,2,3,4,5],"backNumbers":[6,7]}]'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={10}
                />
              </div>
              <Button onClick={handleJsonImport}>导入</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <CardDescription>
          注意：大乐透前区号码为5个1-35之间的不重复数字，后区号码为2个1-12之间的不重复数字
        </CardDescription>
      </CardFooter>
    </Card>
  )
}
