"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Settings, Star, History, Bell, Target } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserPreferences {
  favoriteNumbers: number[]
  excludeNumbers: number[]
  preferredStrategy: string
  riskLevel: number
  notifications: {
    newDraw: boolean
    predictions: boolean
    analysis: boolean
  }
  theme: string
  autoRefresh: boolean
  refreshInterval: number
}

interface HistoryRecord {
  id: string
  date: Date
  type: "prediction" | "analysis" | "selection"
  numbers: {
    front: number[]
    back: number[]
  }
  strategy: string
  confidence: number
  saved: boolean
}

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteNumbers: [],
    excludeNumbers: [],
    preferredStrategy: "integrated",
    riskLevel: 50,
    notifications: {
      newDraw: true,
      predictions: true,
      analysis: false,
    },
    theme: "system",
    autoRefresh: false,
    refreshInterval: 30,
  })

  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [activeTab, setActiveTab] = useState("preferences")
  const { toast } = useToast()

  // 加载用户偏好设置
  useEffect(() => {
    const savedPrefs = localStorage.getItem("lottery-preferences")
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
    }

    const savedHistory = localStorage.getItem("lottery-history")
    if (savedHistory) {
      setHistory(
        JSON.parse(savedHistory).map((h: any) => ({
          ...h,
          date: new Date(h.date),
        })),
      )
    }
  }, [])

  // 保存偏好设置
  const savePreferences = () => {
    localStorage.setItem("lottery-preferences", JSON.stringify(preferences))
    toast({
      title: "设置已保存",
      description: "您的个性化设置已成功保存",
    })
  }

  // 添加/移除收藏号码
  const toggleFavoriteNumber = (number: number) => {
    setPreferences((prev) => ({
      ...prev,
      favoriteNumbers: prev.favoriteNumbers.includes(number)
        ? prev.favoriteNumbers.filter((n) => n !== number)
        : [...prev.favoriteNumbers, number].slice(0, 10), // 最多10个收藏号码
    }))
  }

  // 添加/移除排除号码
  const toggleExcludeNumber = (number: number) => {
    setPreferences((prev) => ({
      ...prev,
      excludeNumbers: prev.excludeNumbers.includes(number)
        ? prev.excludeNumbers.filter((n) => n !== number)
        : [...prev.excludeNumbers, number].slice(0, 15), // 最多15个排除号码
    }))
  }

  // 保存历史记录
  const saveToHistory = (record: Omit<HistoryRecord, "id" | "date" | "saved">) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date(),
      saved: true,
    }

    const updatedHistory = [newRecord, ...history].slice(0, 50) // 保留最近50条记录
    setHistory(updatedHistory)
    localStorage.setItem("lottery-history", JSON.stringify(updatedHistory))

    toast({
      title: "已保存到历史记录",
      description: "您可以在历史记录中查看和管理",
    })
  }

  // 删除历史记录
  const deleteHistoryRecord = (id: string) => {
    const updatedHistory = history.filter((h) => h.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("lottery-history", JSON.stringify(updatedHistory))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            个性化设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="preferences">偏好设置</TabsTrigger>
              <TabsTrigger value="numbers">号码管理</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
              <TabsTrigger value="notifications">通知设置</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">首选分析策略</Label>
                    <Select
                      value={preferences.preferredStrategy}
                      onValueChange={(value) => setPreferences((prev) => ({ ...prev, preferredStrategy: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">热门号码策略</SelectItem>
                        <SelectItem value="cold">冷门号码策略</SelectItem>
                        <SelectItem value="balanced">平衡策略</SelectItem>
                        <SelectItem value="trend">趋势跟踪</SelectItem>
                        <SelectItem value="integrated">综合分析</SelectItem>
                        <SelectItem value="ml">机器学习</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">风险偏好</Label>
                    <div className="mt-2 space-y-2">
                      <Slider
                        value={[preferences.riskLevel]}
                        onValueChange={([value]) => setPreferences((prev) => ({ ...prev, riskLevel: value }))}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>保守</span>
                        <span>当前: {preferences.riskLevel}%</span>
                        <span>激进</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">界面主题</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => setPreferences((prev) => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">浅色主题</SelectItem>
                        <SelectItem value="dark">深色主题</SelectItem>
                        <SelectItem value="system">跟随系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">自动刷新数据</Label>
                    <Switch
                      checked={preferences.autoRefresh}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoRefresh: checked }))}
                    />
                  </div>

                  {preferences.autoRefresh && (
                    <div>
                      <Label className="text-sm text-muted-foreground">刷新间隔 (分钟)</Label>
                      <Input
                        type="number"
                        value={preferences.refreshInterval}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            refreshInterval: Number.parseInt(e.target.value) || 30,
                          }))
                        }
                        min={5}
                        max={120}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="pt-4">
                    <Button onClick={savePreferences} className="w-full">
                      保存设置
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="numbers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      收藏号码 ({preferences.favoriteNumbers.length}/10)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {preferences.favoriteNumbers.map((num) => (
                          <Badge
                            key={num}
                            variant="default"
                            className="cursor-pointer bg-yellow-500 hover:bg-yellow-600"
                            onClick={() => toggleFavoriteNumber(num)}
                          >
                            {num} ×
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => (
                          <Button
                            key={num}
                            variant={preferences.favoriteNumbers.includes(num) ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => toggleFavoriteNumber(num)}
                            disabled={
                              !preferences.favoriteNumbers.includes(num) && preferences.favoriteNumbers.length >= 10
                            }
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Target className="h-4 w-4 mr-2 text-red-500" />
                      排除号码 ({preferences.excludeNumbers.length}/15)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {preferences.excludeNumbers.map((num) => (
                          <Badge
                            key={num}
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => toggleExcludeNumber(num)}
                          >
                            {num} ×
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => (
                          <Button
                            key={num}
                            variant={preferences.excludeNumbers.includes(num) ? "destructive" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => toggleExcludeNumber(num)}
                            disabled={
                              !preferences.excludeNumbers.includes(num) && preferences.excludeNumbers.length >= 15
                            }
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">历史记录 ({history.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHistory([])
                    localStorage.removeItem("lottery-history")
                    toast({ title: "历史记录已清空" })
                  }}
                >
                  清空记录
                </Button>
              </div>

              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无历史记录</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {record.type === "prediction" ? "预测" : record.type === "analysis" ? "分析" : "选号"}
                              </Badge>
                              <Badge variant="outline">{record.strategy}</Badge>
                              <span className="text-sm text-muted-foreground">{record.date.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">前区:</span>
                                {record.numbers.front.map((num) => (
                                  <div
                                    key={num}
                                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">后区:</span>
                                {record.numbers.back.map((num) => (
                                  <div
                                    key={num}
                                    className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{(record.confidence * 100).toFixed(0)}%</Badge>
                            <Button variant="ghost" size="sm" onClick={() => deleteHistoryRecord(record.id)}>
                              删除
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">新开奖通知</Label>
                    <p className="text-sm text-muted-foreground">有新的开奖结果时通知我</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.newDraw}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, newDraw: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">预测结果通知</Label>
                    <p className="text-sm text-muted-foreground">AI预测完成时通知我</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.predictions}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, predictions: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">分析报告通知</Label>
                    <p className="text-sm text-muted-foreground">深度分析完成时通知我</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.analysis}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, analysis: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={savePreferences} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  保存通知设置
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
