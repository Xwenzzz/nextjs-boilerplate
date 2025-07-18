"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Save, Trash2, Settings, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// 验证规则类型
interface VerificationRule {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  severity: "low" | "medium" | "high"
  parameters?: Record<string, any>
}

// 规则类别
const RULE_CATEGORIES = [
  { id: "number", name: "号码规则", description: "验证号码的基本规则" },
  { id: "pattern", name: "模式规则", description: "验证号码的模式和组合" },
  { id: "statistical", name: "统计规则", description: "基于历史数据的统计验证" },
  { id: "custom", name: "自定义规则", description: "用户自定义的验证规则" },
]

// 预设规则
const DEFAULT_RULES: VerificationRule[] = [
  {
    id: "rule1",
    name: "重复号码检查",
    description: "检查是否与最近N期的开奖号码重复",
    category: "number",
    enabled: true,
    severity: "high",
    parameters: { periods: 10 },
  },
  {
    id: "rule2",
    name: "连号检查",
    description: "检查是否存在3个以上的连续号码",
    category: "pattern",
    enabled: true,
    severity: "medium",
  },
  {
    id: "rule3",
    name: "奇偶比例",
    description: "检查奇偶数字的比例是否平衡",
    category: "statistical",
    enabled: false,
    severity: "low",
    parameters: { minRatio: 0.3, maxRatio: 0.7 },
  },
  {
    id: "rule4",
    name: "冷热号平衡",
    description: "检查冷热号码的分布是否平衡",
    category: "statistical",
    enabled: true,
    severity: "medium",
  },
  {
    id: "rule5",
    name: "和值范围",
    description: "检查号码和值是否在合理范围内",
    category: "number",
    enabled: true,
    severity: "medium",
    parameters: { minSum: 60, maxSum: 140 },
  },
  {
    id: "rule6",
    name: "跨度检查",
    description: "检查号码的最大跨度是否合理",
    category: "pattern",
    enabled: false,
    severity: "low",
    parameters: { maxSpan: 30 },
  },
]

export default function VerificationPanel() {
  const [activeCategory, setActiveCategory] = useState(RULE_CATEGORIES[0].id)
  const [rules, setRules] = useState<VerificationRule[]>(DEFAULT_RULES)
  const [editingRule, setEditingRule] = useState<VerificationRule | null>(null)
  const [isAddingRule, setIsAddingRule] = useState(false)
  const { toast } = useToast()

  // 过滤当前类别的规则
  const filteredRules = rules.filter((rule) => rule.category === activeCategory)

  // 切换规则启用状态
  const toggleRuleEnabled = (ruleId: string) => {
    setRules(rules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  // 删除规则
  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId))
    toast({
      title: "规则已删除",
      description: "验证规则已成功删除",
    })
  }

  // 保存规则配置
  const saveConfiguration = () => {
    // 这里可以实现保存到API或本地存储的逻辑
    toast({
      title: "配置已保存",
      description: "验证规则配置已成功保存",
      variant: "default",
    })
  }

  // 添加新规则
  const addNewRule = () => {
    const newRule: VerificationRule = {
      id: `rule${Date.now()}`,
      name: "新规则",
      description: "请输入规则描述",
      category: activeCategory,
      enabled: true,
      severity: "medium",
    }

    setRules([...rules, newRule])
    setEditingRule(newRule)
    toast({
      title: "已添加新规则",
      description: "请配置新规则的详细信息",
    })
  }

  // 更新规则
  const updateRule = (updatedRule: VerificationRule) => {
    setRules(rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
    setEditingRule(null)
    toast({
      title: "规则已更新",
      description: "验证规则已成功更新",
    })
  }

  // 渲染规则编辑表单
  const renderRuleEditForm = () => {
    if (!editingRule) return null

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>编辑规则</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">规则名称</Label>
              <Input
                id="rule-name"
                value={editingRule.name}
                onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rule-description">规则描述</Label>
              <Input
                id="rule-description"
                value={editingRule.description}
                onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rule-severity">严重程度</Label>
              <select
                id="rule-severity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingRule.severity}
                onChange={(e) =>
                  setEditingRule({ ...editingRule, severity: e.target.value as "low" | "medium" | "high" })
                }
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                取消
              </Button>
              <Button onClick={() => updateRule(editingRule)}>保存</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 渲染规则项
  const renderRuleItem = (rule: VerificationRule) => {
    return (
      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{rule.name}</h3>
            <Badge
              variant={rule.severity === "high" ? "destructive" : rule.severity === "medium" ? "default" : "outline"}
            >
              {rule.severity === "high" ? "高" : rule.severity === "medium" ? "中" : "低"}
            </Badge>
            {rule.enabled ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={rule.enabled}
            onCheckedChange={() => toggleRuleEnabled(rule.id)}
            aria-label={`${rule.enabled ? "禁用" : "启用"}规则`}
          />
          <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>验证规则配置</CardTitle>
        <CardDescription>配置号码验证规则，使用"扣子"开关来启用或禁用规则</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <TabsList className="flex flex-col h-auto w-full bg-muted/50 p-1">
                {RULE_CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="justify-start w-full mb-1 data-[state=active]:bg-background"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-6">
                <Button onClick={saveConfiguration} className="w-full mb-2">
                  <Save className="mr-2 h-4 w-4" />
                  保存配置
                </Button>
              </div>
            </div>

            <div className="md:w-3/4">
              {RULE_CATEGORIES.map((category) => (
                <TabsContent key={category.id} value={category.id} className="m-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Button onClick={addNewRule} variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      添加规则
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {filteredRules.length > 0 ? (
                        filteredRules.map(renderRuleItem)
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                          <h3 className="font-medium">没有找到规则</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            当前类别下没有验证规则，点击"添加规则"创建新规则
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {editingRule && renderRuleEditForm()}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
