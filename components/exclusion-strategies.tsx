"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Info, Filter, XCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { LotteryDraw } from "@/types/lottery"

interface ExclusionStrategiesProps {
  data: LotteryDraw[]
}

interface ExclusionRule {
  id: string
  name: string
  description: string
  enabled: boolean
  fn: (num: number) => boolean
}

export default function ExclusionStrategies({ data }: ExclusionStrategiesProps) {
  const [excludedFront, setExcludedFront] = useState<number[]>([])
  const [excludedBack, setExcludedBack] = useState<number[]>([])
  const [customExclude, setCustomExclude] = useState("")
  const { toast } = useToast()

  // 预定义的排除规则
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([
    {
      id: "lastDraw",
      name: "排除上期号码",
      description: "排除最近一期开出的号码",
      enabled: true,
      fn: () => false, // 将在下方动态设置
    },
    {
      id: "continuous",
      name: "排除连号",
      description: "排除与已选号码相邻的号码",
      enabled: false,
      fn: () => false, // 将在下方动态设置
    },
    {
      id: "sameTail",
      name: "排除同尾号",
      description: "排除与已选号码尾数相同的号码",
      enabled: false,
      fn: () => false, // 将在下方动态设置
    },
    {
      id: "sameRemainder3",
      name: "排除同余数(除3)",
      description: "排除与已选号码除3余数相同的号码",
      enabled: false,
      fn: () => false, // 将在下方动态设置
    },
    {
      id: "hotNumbers",
      name: "排除热门号码",
      description: "排除最近10期中出现频率高的号码",
      enabled: false,
      fn: () => false, // 将在下方动态设置
    },
    {
      id: "coldNumbers",
      name: "排除冷门号码",
      description: "排除最近30期未出现的号码",
      enabled: false,
      fn: () => false, // 将在下方动态设置
    },
  ])

  // 当前最新一期数据
  const latestDraw = useMemo(() => {
    return data && data.length > 0 ? data[0] : null
  }, [data])

  // 计算热门号码
  const hotNumbers = useMemo(() => {
    if (!data || data.length === 0) return { front: [], back: [] }

    const frontFreq: Record<number, number> = {}
    const backFreq: Record<number, number> = {}

    // 初始化
    for (let i = 1; i <= 35; i++) frontFreq[i] = 0
    for (let i = 1; i <= 12; i++) backFreq[i] = 0

    // 只统计最近10期
    const recent = data.slice(0, 10)
    recent.forEach((draw) => {
      if (draw.frontNumbers) {
        draw.frontNumbers.forEach((num) => {
          frontFreq[num] = (frontFreq[num] || 0) + 1
        })
      }

      if (draw.backNumbers) {
        draw.backNumbers.forEach((num) => {
          backFreq[num] = (backFreq[num] || 0) + 1
        })
      }
    })

    // 找出出现次数>=3次的前区号码和>=2次的后区号码
    const hotFront = Object.entries(frontFreq)
      .filter(([_, freq]) => freq >= 3)
      .map(([num]) => Number(num))

    const hotBack = Object.entries(backFreq)
      .filter(([_, freq]) => freq >= 2)
      .map(([num]) => Number(num))

    return { front: hotFront, back: hotBack }
  }, [data])

  // 计算冷门号码
  const coldNumbers = useMemo(() => {
    if (!data || data.length === 0) return { front: [], back: [] }

    const frontAppeared = new Set<number>()
    const backAppeared = new Set<number>()

    // 只统计最近30期
    const recent = data.slice(0, 30)
    recent.forEach((draw) => {
      if (draw.frontNumbers) {
        draw.frontNumbers.forEach((num) => frontAppeared.add(num))
      }

      if (draw.backNumbers) {
        draw.backNumbers.forEach((num) => backAppeared.add(num))
      }
    })

    // 找出未出现的号码
    const coldFront = Array.from({ length: 35 }, (_, i) => i + 1).filter((num) => !frontAppeared.has(num))

    const coldBack = Array.from({ length: 12 }, (_, i) => i + 1).filter((num) => !backAppeared.has(num))

    return { front: coldFront, back: coldBack }
  }, [data])

  // 更新规则函数
  useMemo(() => {
    const updatedRules = exclusionRules.map((rule) => {
      switch (rule.id) {
        case "lastDraw":
          rule.fn = (num: number) => {
            if (!latestDraw) return false
            return latestDraw.frontNumbers?.includes(num) || latestDraw.backNumbers?.includes(num) || false
          }
          break
        case "continuous":
          rule.fn = (num: number) => {
            // 检查是否与已排除的号码相邻
            return (
              excludedFront.some((excluded) => Math.abs(excluded - num) === 1) ||
              excludedBack.some((excluded) => Math.abs(excluded - num) === 1)
            )
          }
          break
        case "sameTail":
          rule.fn = (num: number) => {
            // 检查是否与已排除的号码尾数相同
            const tail = num % 10
            return (
              excludedFront.some((excluded) => excluded % 10 === tail) ||
              excludedBack.some((excluded) => excluded % 10 === tail)
            )
          }
          break
        case "sameRemainder3":
          rule.fn = (num: number) => {
            // 检查是否与已排除的号码除3余数相同
            const remainder = num % 3
            return (
              excludedFront.some((excluded) => excluded % 3 === remainder) ||
              excludedBack.some((excluded) => excluded % 3 === remainder)
            )
          }
          break
        case "hotNumbers":
          rule.fn = (num: number) => {
            return hotNumbers.front.includes(num) || hotNumbers.back.includes(num)
          }
          break
        case "coldNumbers":
          rule.fn = (num: number) => {
            return coldNumbers.front.includes(num) || coldNumbers.back.includes(num)
          }
          break
      }
      return rule
    })

    setExclusionRules(updatedRules)
  }, [latestDraw, excludedFront, excludedBack, hotNumbers, coldNumbers])

  // 切换规则启用状态
  const toggleRule = (id: string) => {
    setExclusionRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  // 添加自定义排除号码
  const addCustomExclusion = () => {
    const num = Number.parseInt(customExclude)
    if (isNaN(num) || num <= 0) {
      toast({
        title: "输入错误",
        description: "请输入有效的号码",
        variant: "destructive",
      })
      return
    }

    if (num >= 1 && num <= 35) {
      if (excludedFront.includes(num)) {
        toast({
          description: `号码 ${num} 已在前区排除列表中`,
        })
        return
      }
      setExcludedFront((prev) => [...prev, num].sort((a, b) => a - b))
      toast({
        description: `已添加号码 ${num} 到前区排除列表`,
      })
    } else if (num >= 1 && num <= 12) {
      if (excludedBack.includes(num)) {
        toast({
          description: `号码 ${num} 已在后区排除列表中`,
        })
        return
      }
      setExcludedBack((prev) => [...prev, num].sort((a, b) => a - b))
      toast({
        description: `已添加号码 ${num} 到后区排除列表`,
      })
    } else {
      toast({
        title: "号码范围错误",
        description: "前区号码范围为1-35，后区号码范围为1-12",
        variant: "destructive",
      })
    }

    setCustomExclude("")
  }

  // 从排除列表中移除号码
  const removeFromExclusion = (num: number, zone: "front" | "back") => {
    if (zone === "front") {
      setExcludedFront((prev) => prev.filter((n) => n !== num))
    } else {
      setExcludedBack((prev) => prev.filter((n) => n !== num))
    }

    toast({
      description: `已从${zone === "front" ? "前" : "后"}区排除列表中移除号码 ${num}`,
    })
  }

  // 应用规则自动排除号码
  const applyRules = () => {
    // 获取所有启用的规则
    const enabledRules = exclusionRules.filter((rule) => rule.enabled)

    if (enabledRules.length === 0) {
      toast({
        title: "无可用规则",
        description: "请先启用至少一个排除规则",
      })
      return
    }

    // 前区号码
    const frontExclusions: number[] = []
    for (let num = 1; num <= 35; num++) {
      // 如果任一规则判定该号码应被排除，则添加到排除列表
      if (enabledRules.some((rule) => rule.fn(num))) {
        frontExclusions.push(num)
      }
    }

    // 后区号码
    const backExclusions: number[] = []
    for (let num = 1; num <= 12; num++) {
      if (enabledRules.some((rule) => rule.fn(num))) {
        backExclusions.push(num)
      }
    }

    // 更新排除列表
    setExcludedFront(frontExclusions.sort((a, b) => a - b))
    setExcludedBack(backExclusions.sort((a, b) => a - b))

    toast({
      title: "规则已应用",
      description: `已排除前区${frontExclusions.length}个号码，后区${backExclusions.length}个号码`,
    })
  }

  // 清除所有排除
  const clearAllExclusions = () => {
    setExcludedFront([])
    setExcludedBack([])
    toast({
      description: "已清除所有排除号码",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>号码排除策略</CardTitle>
          <CardDescription>设置排除策略，缩小选号范围，提高命中概率</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">排除规则</h3>
              <div className="space-y-4">
                {exclusionRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    <div className="flex-1">
                      <div className="font-medium">{rule.name}</div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={clearAllExclusions}>
                    <XCircle className="mr-2 h-4 w-4" />
                    清除排除号码
                  </Button>
                  <Button onClick={applyRules}>
                    <Filter className="mr-2 h-4 w-4" />
                    应用排除规则
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">自定义排除</h3>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="35"
                    placeholder="输入要排除的号码"
                    value={customExclude}
                    onChange={(e) => setCustomExclude(e.target.value)}
                  />
                  <Button onClick={addCustomExclusion}>添加</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  输入1-35之间的号码将添加到前区排除列表，1-12之间的号码也可能添加到后区排除列表
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">已排除号码</h3>

              <div className="mb-6">
                <Label className="text-sm mb-1 block">前区排除号码</Label>
                <div className="border rounded-md p-3 min-h-[100px]">
                  {excludedFront.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {excludedFront.map((num) => (
                        <Badge
                          key={`front-${num}`}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeFromExclusion(num, "front")}
                        >
                          {num} <XCircle className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无排除号码</div>
                  )}
                </div>
                {excludedFront.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    已排除 {excludedFront.length}/35 个号码，剩余可选 {35 - excludedFront.length} 个号码
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm mb-1 block">后区排除号码</Label>
                <div className="border rounded-md p-3 min-h-[100px]">
                  {excludedBack.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {excludedBack.map((num) => (
                        <Badge
                          key={`back-${num}`}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeFromExclusion(num, "back")}
                        >
                          {num} <XCircle className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无排除号码</div>
                  )}
                </div>
                {excludedBack.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    已排除 {excludedBack.length}/12 个号码，剩余可选 {12 - excludedBack.length} 个号码
                  </p>
                )}
              </div>

              {(excludedFront.length >= 30 || excludedBack.length >= 10) && (
                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">已排除过多号码，可能导致选号范围过小</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
              <div>
                <h4 className="font-medium mb-2">使用说明</h4>
                <p className="text-sm text-muted-foreground">
                  排除策略是一种缩小选号范围的有效方法，通过分析历史数据和号码规律，排除不太可能出现的号码，
                  从而提高命中概率。您可以选择预设的排除规则，也可以手动添加要排除的号码。
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  注意：不建议排除过多号码，以免错过潜在的中奖组合。建议前区保留至少10个号码，后区保留至少5个号码。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
