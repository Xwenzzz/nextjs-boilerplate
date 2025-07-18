"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Database, FileSpreadsheet } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { LotteryDraw } from "@/types/lottery"

interface DataExportProps {
  data: LotteryDraw[]
}

export function DataExport({ data }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "txt">("csv")
  const [exportCount, setExportCount] = useState<string>("50")
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // 计算分析数据
  const calculateAnalysisData = (draw: LotteryDraw) => {
    const allNumbers = [...draw.frontNumbers, ...draw.backNumbers]
    const sum = allNumbers.reduce((a, b) => a + b, 0)
    const oddCount = allNumbers.filter((n) => n % 2 === 1).length
    const evenCount = allNumbers.length - oddCount
    const bigCount = allNumbers.filter((n) => n > 18).length
    const smallCount = allNumbers.length - bigCount

    return {
      sum,
      oddEvenRatio: `${oddCount}:${evenCount}`,
      bigSmallRatio: `${bigCount}:${smallCount}`,
      span: Math.max(...allNumbers) - Math.min(...allNumbers),
    }
  }

  // 导出为CSV格式
  const exportToCSV = (exportData: LotteryDraw[]) => {
    let csvContent = includeAnalysis
      ? "期号,开奖日期,前区号码,后区号码,奖金,销售额,和值,奇偶比,大小比,跨度\n"
      : "期号,开奖日期,前区号码,后区号码,奖金,销售额\n"

    exportData.forEach((draw) => {
      const frontStr = draw.frontNumbers.join(" ")
      const backStr = draw.backNumbers.join(" ")

      let row = `${draw.drawNumber},${draw.drawDate},"${frontStr}","${backStr}",${draw.prize},${draw.sales}`

      if (includeAnalysis) {
        const analysis = calculateAnalysisData(draw)
        row += `,${analysis.sum},${analysis.oddEvenRatio},${analysis.bigSmallRatio},${analysis.span}`
      }

      csvContent += row + "\n"
    })

    return csvContent
  }

  // 导出为JSON格式
  const exportToJSON = (exportData: LotteryDraw[]) => {
    const jsonData = exportData.map((draw) => {
      const baseData = {
        drawNumber: draw.drawNumber,
        drawDate: draw.drawDate,
        frontNumbers: draw.frontNumbers,
        backNumbers: draw.backNumbers,
        prize: draw.prize,
        sales: draw.sales,
      }

      if (includeAnalysis) {
        const analysis = calculateAnalysisData(draw)
        return { ...baseData, analysis }
      }

      return baseData
    })

    return JSON.stringify(jsonData, null, 2)
  }

  // 导出为TXT格式
  const exportToTXT = (exportData: LotteryDraw[]) => {
    let txtContent = `大乐透历史开奖数据导出\n导出时间: ${new Date().toLocaleString()}\n导出期数: ${exportData.length}期\n\n`

    exportData.forEach((draw, index) => {
      txtContent += `第${index + 1}期数据:\n`
      txtContent += `期号: ${draw.drawNumber}\n`
      txtContent += `开奖日期: ${draw.drawDate}\n`
      txtContent += `前区号码: ${draw.frontNumbers.join(" ")}\n`
      txtContent += `后区号码: ${draw.backNumbers.join(" ")}\n`
      txtContent += `奖金: ${draw.prize}\n`
      txtContent += `销售额: ${draw.sales}\n`

      if (includeAnalysis) {
        const analysis = calculateAnalysisData(draw)
        txtContent += `和值: ${analysis.sum}\n`
        txtContent += `奇偶比: ${analysis.oddEvenRatio}\n`
        txtContent += `大小比: ${analysis.bigSmallRatio}\n`
        txtContent += `跨度: ${analysis.span}\n`
      }

      txtContent += "\n" + "-".repeat(50) + "\n\n"
    })

    return txtContent
  }

  // 下载文件
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 执行导出
  const handleExport = async () => {
    if (data.length === 0) {
      toast({
        title: "导出失败",
        description: "没有可导出的数据",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // 确定导出数据量
      const count = exportCount === "all" ? data.length : Number.parseInt(exportCount)
      const exportData = data.slice(0, Math.min(count, data.length))

      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")
      const filename = `大乐透数据_${exportData.length}期_${timestamp}.${exportFormat}`

      // 根据格式导出
      let content: string
      let mimeType: string

      switch (exportFormat) {
        case "csv":
          content = exportToCSV(exportData)
          mimeType = "text/csv;charset=utf-8"
          break
        case "json":
          content = exportToJSON(exportData)
          mimeType = "application/json;charset=utf-8"
          break
        case "txt":
          content = exportToTXT(exportData)
          mimeType = "text/plain;charset=utf-8"
          break
        default:
          throw new Error("不支持的导出格式")
      }

      // 添加BOM以支持中文
      const BOM = "\uFEFF"
      downloadFile(BOM + content, filename, mimeType)

      toast({
        title: "导出成功",
        description: `已导出 ${exportData.length} 期数据到 ${filename}`,
      })
    } catch (error) {
      console.error("导出失败:", error)
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileSpreadsheet className="h-4 w-4" />
      case "json":
        return <Database className="h-4 w-4" />
      case "txt":
        return <FileText className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          数据导出
        </CardTitle>
        <CardDescription>导出历史开奖数据到本地文件，支持多种格式</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 数据统计 */}
        <div className="flex items-center gap-4">
          <Badge variant="outline">可用数据: {data.length} 期</Badge>
          <Badge variant="outline">最新期号: {data[0]?.drawNumber || "无"}</Badge>
        </div>

        {/* 导出设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">导出格式</label>
            <Select value={exportFormat} onValueChange={(value: "csv" | "json" | "txt") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel兼容)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON (程序处理)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    TXT (文本格式)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">导出期数</label>
            <Select value={exportCount} onValueChange={setExportCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">最近 20 期</SelectItem>
                <SelectItem value="30">最近 30 期</SelectItem>
                <SelectItem value="50">最近 50 期</SelectItem>
                <SelectItem value="100">最近 100 期</SelectItem>
                <SelectItem value="all">全部数据 ({data.length} 期)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 附加选项 */}
        <div className="flex items-center space-x-2">
          <Checkbox id="include-analysis" checked={includeAnalysis} onCheckedChange={setIncludeAnalysis} />
          <label
            htmlFor="include-analysis"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            包含分析数据 (和值、奇偶比、大小比、跨度)
          </label>
        </div>

        {/* 导出按钮 */}
        <Button onClick={handleExport} disabled={isExporting || data.length === 0} className="w-full" size="lg">
          {getFormatIcon(exportFormat)}
          {isExporting ? "导出中..." : `导出 ${exportFormat.toUpperCase()} 文件`}
        </Button>

        {/* 格式说明 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>CSV:</strong> 适合在Excel中打开分析，支持中文显示
          </p>
          <p>
            <strong>JSON:</strong> 适合程序处理，保持数据结构完整
          </p>
          <p>
            <strong>TXT:</strong> 纯文本格式，易于阅读和打印
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
