"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarIcon, Search, Loader2, AlertTriangle } from "lucide-react"
import { formatCurrency, formatIssueNo } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import LotteryBall from "@/components/lottery-ball" // 修正：从命名导入改为默认导入
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RefreshCw } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface LatestDrawsProps {
  initialData: LotteryDraw[]
}

// 安全地处理数组
function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : []
}

// 安全地处理对象
function safeObject<T extends Record<string, any>>(obj: T | null | undefined): T {
  return obj && typeof obj === "object" ? obj : ({} as T)
}

export default function LatestDraws({ initialData }: LatestDrawsProps) {
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>(safeArray(initialData))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  const itemsPerPage = 10

  // 过滤和排序数据
  const filteredData = useMemo(() => {
    try {
      let dataToFilter = safeArray(lotteryData)

      // 按期号降序排序
      dataToFilter.sort((a, b) => {
        const issueA = Number.parseInt(safeObject(a).drawNumber || "0") // 使用 drawNumber
        const issueB = Number.parseInt(safeObject(b).drawNumber || "0") // 使用 drawNumber
        return issueB - issueA
      })

      // 按搜索词过滤
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase()
        dataToFilter = dataToFilter.filter((draw) => {
          const safeDraw = safeObject(draw)
          return (
            safeDraw.drawNumber
              ?.toLowerCase()
              .includes(lowerCaseSearchTerm) || // 使用 drawNumber
            safeDraw.drawDate?.toLowerCase().includes(lowerCaseSearchTerm) ||
            safeArray(safeDraw.frontNumbers).some((num) => String(num).includes(lowerCaseSearchTerm)) ||
            safeArray(safeDraw.backNumbers).some((num) => String(num).includes(lowerCaseSearchTerm))
          )
        })
      }

      // 按日期过滤
      if (selectedDate) {
        const formattedSelectedDate = selectedDate.toISOString().split("T")[0]
        dataToFilter = dataToFilter.filter((draw) => {
          const safeDraw = safeObject(draw)
          return safeDraw.drawDate?.includes(formattedSelectedDate)
        })
      }

      return dataToFilter
    } catch (e) {
      console.error("过滤数据时出错:", e)
      setError("过滤数据时发生错误。")
      return []
    }
  }, [lotteryData, searchTerm, selectedDate])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  // 模拟数据获取
  const fetchLotteryData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 实际应用中这里会调用API
      const response = await fetch("/api/lottery") // 调用 /api/lottery 获取数据
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "API返回失败")
      }
      setLotteryData(safeArray(result.data))
      toast({
        title: "数据已更新",
        description: "最新开奖数据已成功加载。",
      })
    } catch (e) {
      console.error("获取数据失败:", e)
      setError(e instanceof Error ? e.message : "无法加载最新开奖数据。")
      toast({
        title: "数据加载失败",
        description: "无法从服务器获取开奖数据。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLotteryData()
  }, [fetchLotteryData])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setCurrentPage(1) // 日期筛选后回到第一页
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          最新开奖数据
        </CardTitle>
        <CardDescription>查看大乐透最新开奖结果，支持期号、日期和号码搜索。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索期号、日期或号码..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // 搜索后回到第一页
              }}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? selectedDate.toLocaleDateString() : "选择日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
          <Button onClick={fetchLotteryData} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            刷新数据
          </Button>
        </div>

        {error && (
          <div className="flex items-center justify-center h-48">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <span className="ml-3 text-destructive">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-3 text-muted-foreground">正在加载数据...</span>
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到开奖数据</h3>
            <p className="text-muted-foreground max-w-md">请尝试调整搜索条件或导入更多历史数据。</p>
          </div>
        )}

        {!loading && filteredData.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>期号</TableHead>
                  <TableHead>开奖日期</TableHead>
                  <TableHead>前区号码</TableHead>
                  <TableHead>后区号码</TableHead>
                  <TableHead className="text-right">销售额</TableHead>
                  <TableHead className="text-right">奖池金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((draw) => {
                  const safeDraw = safeObject(draw)
                  return (
                    <TableRow key={safeDraw.drawNumber}>
                      <TableCell className="font-medium">{formatIssueNo(safeDraw.drawNumber)}</TableCell>
                      <TableCell>{safeDraw.drawDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {safeArray(safeDraw.frontNumbers).map((num, index) => (
                            <LotteryBall key={index} number={num} type="red" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {safeArray(safeDraw.backNumbers).map((num, index) => (
                            <LotteryBall key={index} number={num} type="blue" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {safeDraw.sales ? formatCurrency(safeDraw.sales) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {safeDraw.poolAmount ? formatCurrency(safeDraw.poolAmount) : "N/A"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  )
}
