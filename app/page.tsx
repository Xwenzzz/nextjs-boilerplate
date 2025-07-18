"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Brain,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  Target,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import LatestDraws from "@/components/latest-draws"
import SmartNumberPicker from "@/components/smart-number-picker"
import SelfLearningAnalysis from "@/components/self-learning-analysis"
import DataImport from "@/components/data-import"
import PredictionAnalysis from "@/components/prediction-analysis"
import { formatJackpot, formatCurrency } from "@/lib/utils"
import type { LotteryDraw } from "@/types/lottery"

export default function HomePage() {
  const [data, setData] = useState<LotteryDraw[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // 加载数据 - 支持指定期数
  const loadData = async (count = 50) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lottery?count=${count}`)
      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setData(result.data)
        toast({
          title: "数据加载成功",
          description: `成功加载${result.data.length}期开奖数据 (请求${count}期)`,
        })
      } else {
        throw new Error(result.error || "数据格式错误")
      }
    } catch (error) {
      console.error("加载数据失败:", error)
      toast({
        title: "数据加载失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 页面加载时自动获取数据
  useEffect(() => {
    loadData()
  }, [])

  // 数据统计
  const stats = {
    totalDraws: data.length,
    latestDraw: data[0]?.drawNumber || "暂无",
    estimatedJackpot: formatJackpot(Math.random() * 500000000 + 100000000),
    avgSales:
      data.length > 0
        ? formatCurrency(
            data.reduce((sum, draw) => {
              const sales =
                typeof draw.sales === "string" ? Number.parseFloat(draw.sales.replace(/[^\d.]/g, "")) : draw.sales || 0
              return sum + sales
            }, 0) / data.length,
          )
        : "计算中",
  }

  // 导出CSV函数
  function exportToCSV(exportData: LotteryDraw[]) {
    if (exportData.length === 0) {
      toast({
        title: "导出失败",
        description: "没有可导出的数据",
        variant: "destructive",
      })
      return
    }

    let csvContent = "期号,开奖日期,前区号码,后区号码,奖金,销售额\n"

    exportData.forEach((draw) => {
      const frontStr = draw.frontNumbers.join(" ")
      const backStr = draw.backNumbers.join(" ")
      csvContent += `${draw.drawNumber},${draw.drawDate},"${frontStr}","${backStr}",${draw.prize},${draw.sales}\n`
    })

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `大乐透数据_${exportData.length}期_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: `已导出 ${exportData.length} 期数据到CSV文件`,
    })
  }

  // 导出JSON函数
  function exportToJSON(exportData: LotteryDraw[]) {
    if (exportData.length === 0) {
      toast({
        title: "导出失败",
        description: "没有可导出的数据",
        variant: "destructive",
      })
      return
    }

    const jsonData = {
      exportTime: new Date().toISOString(),
      totalCount: exportData.length,
      data: exportData,
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `大乐透数据_${exportData.length}期_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: `已导出 ${exportData.length} 期数据到JSON文件`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-4">
            大乐透智能分析选号系统
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            基于历史数据的AI智能分析，提供科学的选号建议和深度数据洞察
          </p>
        </div>

        {/* 数据概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 opacity-75" />
                <div className="ml-4">
                  <p className="text-red-100">历史期数</p>
                  <p className="text-2xl font-bold">{stats.totalDraws}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 opacity-75" />
                <div className="ml-4">
                  <p className="text-blue-100">最新期号</p>
                  <p className="text-2xl font-bold">{stats.latestDraw}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 opacity-75" />
                <div className="ml-4">
                  <p className="text-green-100">奖池金额</p>
                  <p className="text-2xl font-bold">{stats.estimatedJackpot}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 opacity-75" />
                <div className="ml-4">
                  <p className="text-purple-100">平均销售额</p>
                  <p className="text-xl font-bold">{stats.avgSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 数据状态提示 */}
        {data.length === 0 && !isLoading && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>暂无开奖数据。请点击"刷新数据"按钮获取最新数据，或使用数据导入功能。</AlertDescription>
          </Alert>
        )}

        {data.length > 0 && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              已加载{data.length}期开奖数据，系统已准备就绪。您可以使用智能选号和自主学习功能。
            </AlertDescription>
          </Alert>
        )}

        {/* 主要功能区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full sm:w-auto">
              <TabsTrigger value="overview">数据概览</TabsTrigger>
              <TabsTrigger value="smart-picker">智能选号</TabsTrigger>
              <TabsTrigger value="self-learning">自主学习</TabsTrigger>
              <TabsTrigger value="prediction-analysis">预测分析</TabsTrigger>
              <TabsTrigger value="data-import">数据管理</TabsTrigger>
              <TabsTrigger value="analytics">深度分析</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => loadData(20)} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                获取20期
              </Button>
              <Button onClick={() => loadData(50)} disabled={isLoading} variant="outline" size="sm">
                获取50期
              </Button>
              <Button onClick={() => loadData(100)} disabled={isLoading} variant="outline" size="sm">
                获取100期
              </Button>
            </div>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LatestDraws data={data} limit={5} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    系统功能
                  </CardTitle>
                  <CardDescription>探索强大的AI分析功能</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
                      <Sparkles className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">智能选号</h4>
                        <p className="text-sm text-muted-foreground">基于历史数据分析，提供多种策略的智能选号建议</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50">
                      <Brain className="h-6 w-6 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-medium">自主学习</h4>
                        <p className="text-sm text-muted-foreground">机器学习算法自动发现规律，持续优化预测模型</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
                      <BarChart3 className="h-6 w-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">深度分析</h4>
                        <p className="text-sm text-muted-foreground">多维度数据分析，包括频率、趋势、周期等深度洞察</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50">
                      <Database className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h4 className="font-medium">数据管理</h4>
                        <p className="text-sm text-muted-foreground">灵活的数据导入和管理功能，支持多种数据源</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="smart-picker">
            <SmartNumberPicker data={data} />
          </TabsContent>

          <TabsContent value="self-learning">
            <SelfLearningAnalysis data={data} />
          </TabsContent>

          <TabsContent value="prediction-analysis">
            <PredictionAnalysis />
          </TabsContent>

          <TabsContent value="data-import">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataImport onDataImported={(newData) => setData(newData)} />

              {/* 数据导出卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    数据导出
                  </CardTitle>
                  <CardDescription>导出历史开奖数据到本地文件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">当前可导出: {data.length} 期数据</div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => exportToCSV(data.slice(0, 50))}
                      disabled={data.length === 0}
                    >
                      导出50期CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportToJSON(data.slice(0, 100))}
                      disabled={data.length === 0}
                    >
                      导出100期JSON
                    </Button>
                  </div>

                  <Button className="w-full" onClick={() => exportToCSV(data)} disabled={data.length === 0}>
                    导出全部数据 ({data.length}期)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>深度分析</CardTitle>
                <CardDescription>更多分析功能正在开发中...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">敬请期待</h3>
                  <p className="text-muted-foreground">更多强大的分析功能即将上线</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 页脚信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>大乐透智能分析选号系统 - 基于AI技术的彩票数据分析平台</p>
          <p className="mt-1">所有分析结果仅供参考，请理性购彩，量力而行</p>
        </div>
      </div>
    </div>
  )
}
