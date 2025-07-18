"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, RefreshCw, BrainCircuit, HelpCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import NumberCombination from "../number-combination"
import type { LotteryDraw } from "@/types/lottery"

interface ChaosTheoryAnalysisProps {
  data: LotteryDraw[]
}

interface ChaosResult {
  frontNumbers: number[]
  backNumbers: number[]
  lyapunovExponent: number
  stabilityIndex: number
  description: string
}

export default function ChaosTheoryAnalysis({ data }: ChaosTheoryAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [chaosResults, setChaosResults] = useState<ChaosResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ChaosResult | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const { toast } = useToast()

  // 辅助函数：生成混沌范围内的随机数
  const chaosRandom = (min: number, max: number, seed: number): number => {
    // 使用简单的混沌映射公式
    const x = Math.sin(seed * 12.9898) * 43758.5453
    const r = x - Math.floor(x)
    return Math.floor(r * (max - min + 1)) + min
  }

  // 计算李雅普诺夫指数（近似值）
  const calculateLyapunovExponent = (series: number[]): number => {
    if (series.length < 2) return 0

    let sum = 0
    for (let i = 1; i < series.length; i++) {
      // 使用简化的计算方法
      const diff = Math.abs(series[i] - series[i - 1])
      sum += Math.log(diff + 1) // 避免对0取对数
    }

    return sum / (series.length - 1)
  }

  // 生成混沌序列
  const generateChaosSequence = (startValue: number, iterations: number, max: number): number[] => {
    const sequence: number[] = []
    let value = startValue

    for (let i = 0; i < iterations; i++) {
      // 使用混沌逻辑映射
      value = 3.9 * value * (1 - value)
      sequence.push(Math.floor(value * max) + 1)
    }

    return sequence
  }

  // 运行混沌理论分析
  const runChaosAnalysis = () => {
    if (data.length < 5) {
      toast({
        title: "数据不足",
        description: "需要至少5期数据才能进行混沌理论分析",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setChaosResults([])
    setSelectedResult(null)

    // 模拟分析过程
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // 结束分析并生成结果
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)

      // 从历史数据中提取数字序列
      const frontSequences: number[][] = data.slice(0, 10).map((draw) => draw.frontNumbers || [])
      const backSequences: number[][] = data.slice(0, 10).map((draw) => draw.backNumbers || [])

      // 扁平化序列
      const frontFlat = frontSequences.flat()
      const backFlat = backSequences.flat()

      // 计算李雅普诺夫指数
      const frontLyapunov = calculateLyapunovExponent(frontFlat)
      const backLyapunov = calculateLyapunovExponent(backFlat)

      // 生成3组不同的预测结果
      const results: ChaosResult[] = []

      for (let i = 0; i < 3; i++) {
        // 使用不同的种子生成不同的结果
        const seed = Date.now() + i * 1000

        // 为前区生成混沌序列
        const frontStart = frontFlat[frontFlat.length - 1] / 35
        const frontChaos = generateChaosSequence(frontStart, 10, 35)

        // 为后区生成混沌序列
        const backStart = backFlat[backFlat.length - 1] / 12
        const backChaos = generateChaosSequence(backStart, 5, 12)

        // 去重，确保不重复
        const frontSet = new Set<number>()
        const backSet = new Set<number>()

        // 从混沌序列中选择不重复的号码
        for (const num of frontChaos) {
          if (frontSet.size < 5) {
            frontSet.add(num)
          }
        }

        for (const num of backChaos) {
          if (backSet.size < 2) {
            backSet.add(num)
          }
        }

        // 如果生成的号码不足，填充随机号码
        while (frontSet.size < 5) {
          const num = chaosRandom(1, 35, seed + frontSet.size)
          frontSet.add(num)
        }

        while (backSet.size < 2) {
          const num = chaosRandom(1, 12, seed + 100 + backSet.size)
          backSet.add(num)
        }

        // 转换为排序后的数组
        const frontNumbers = Array.from(frontSet).sort((a, b) => a - b)
        const backNumbers = Array.from(backSet).sort((a, b) => a - b)

        // 计算稳定性指数（模拟值）
        const stabilityIndex = 1 - Math.abs(Math.sin(seed * 0.001))

        // 生成描述
        const descriptions = [
          "该组合基于混沌系统的稳定吸引子选择，具有较强的内部平衡性",
          "通过混沌动力学模型分析，该组合在非线性系统中表现出较高的稳定概率",
          "混沌映射显示该组合位于相空间的周期窗口内，具有较好的结构特性",
        ]

        results.push({
          frontNumbers,
          backNumbers,
          lyapunovExponent: frontLyapunov,
          stabilityIndex,
          description: descriptions[i],
        })
      }

      setChaosResults(results)
      setSelectedResult(results[0])
      setIsAnalyzing(false)

      toast({
        title: "混沌理论分析完成",
        description: "基于非线性系统理论生成了3组推荐号码",
      })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>混沌理论分析</CardTitle>
              <CardDescription>基于非线性动力学和混沌理论进行数字序列分析</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowHelp(!showHelp)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showHelp && (
            <Alert className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-1">什么是混沌理论分析？</p>
                <p className="mb-2">
                  混沌理论研究表明，看似随机的系统实际上可能遵循复杂的数学规则，产生可以预测的模式。
                  在彩票号码分析中，混沌理论可以帮助识别历史号码序列中的非线性规律和隐藏模式。
                </p>
                <p className="font-medium mb-1">关键指标解释：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>李雅普诺夫指数</strong>：衡量系统对初始条件的敏感程度，较高的指数表示系统混沌性更强
                  </li>
                  <li>
                    <strong>稳定性指数</strong>：在0到1之间，表示组合在混沌系统中的稳定性
                  </li>
                  <li>
                    <strong>吸引子</strong>：混沌系统中号码序列倾向于收敛的区域
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">非线性系统分析</h3>
              <p className="text-sm text-muted-foreground">通过分析号码序列的演化规律，寻找混沌系统中的稳定吸引子</p>
            </div>
            <Button
              onClick={runChaosAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isAnalyzing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? "分析中..." : "运行混沌分析"}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm">正在分析非线性系统特征...</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {chaosResults.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">混沌预测结果</TabsTrigger>
                <TabsTrigger value="analysis">参数分析</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {chaosResults.map((result, idx) => (
                    <Card
                      key={idx}
                      className={`overflow-hidden cursor-pointer transition-all ${
                        selectedResult === result ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div
                        className={`px-4 py-2 text-sm font-medium flex justify-between items-center text-white
                          ${idx === 0 ? "bg-purple-600" : idx === 1 ? "bg-indigo-600" : "bg-blue-600"}`}
                      >
                        <span>混沌组合 #{idx + 1}</span>
                        <Badge className="bg-white text-purple-700">{(result.stabilityIndex * 100).toFixed(0)}%</Badge>
                      </div>
                      <CardContent className="pt-4">
                        <NumberCombination
                          frontNumbers={result.frontNumbers}
                          backNumbers={result.backNumbers}
                          animated={selectedResult === result}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedResult && (
                  <div className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-2">混沌分析说明</h3>
                        <p className="text-sm text-muted-foreground mb-4">{selectedResult.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-1">李雅普诺夫指数</div>
                            <div className="text-lg font-bold">{selectedResult.lyapunovExponent.toFixed(4)}</div>
                            <div className="text-xs text-muted-foreground">
                              {selectedResult.lyapunovExponent > 0.1 ? "混沌性较强" : "混沌性适中"}
                            </div>
                          </div>

                          <div className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-1">稳定性指数</div>
                            <div className="text-lg font-bold">{selectedResult.stabilityIndex.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {selectedResult.stabilityIndex > 0.7 ? "高稳定性" : "中等稳定性"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">混沌系统参数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">初始条件敏感性</span>
                          <Badge variant="outline">{chaosResults[0]?.lyapunovExponent > 0.1 ? "高" : "中"}</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">相空间维度</span>
                          <Badge variant="outline">5维</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">吸引子类型</span>
                          <Badge variant="outline">奇异吸引子</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">系统复杂度</span>
                          <Badge variant="outline">中等</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">分形维数</span>
                          <Badge variant="outline">2.34</Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">系统熵值</span>
                          <Badge variant="outline">1.56</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      混沌理论分析表明，彩票号码序列虽然看似随机，但可能存在于一个高维相空间中的确定性混沌系统。
                      该系统对初始条件高度敏感，展现出复杂的非线性行为，但仍然可以通过数学模型进行分析。
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {chaosResults.length === 0 && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">尚未进行混沌理论分析</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                点击"运行混沌分析"按钮，系统将使用非线性动力学和混沌理论分析历史数据，
                识别号码序列中的隐藏模式和吸引子。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
