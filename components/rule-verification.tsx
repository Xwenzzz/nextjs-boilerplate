"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import type { LotteryDraw } from "@/types/lottery"

interface RuleVerificationProps {
  selectedNumbers: {
    frontNumbers: number[]
    backNumbers: number[]
  }
  historyData: LotteryDraw[]
}

interface VerificationResult {
  id: string
  name: string
  passed: boolean
  message: string
  severity: "low" | "medium" | "high"
}

export default function RuleVerification({ selectedNumbers, historyData = [] }: RuleVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [results, setResults] = useState<VerificationResult[]>([])
  const [verified, setVerified] = useState(false)

  // 执行验证
  const runVerification = () => {
    setIsVerifying(true)
    setVerified(false)

    // 模拟验证过程
    setTimeout(() => {
      const verificationResults = [
        checkDuplicateNumbers(),
        checkConsecutiveNumbers(),
        checkOddEvenRatio(),
        checkHotColdBalance(),
        checkSumRange(),
        checkSpan(),
      ]

      setResults(verificationResults)
      setIsVerifying(false)
      setVerified(true)
    }, 1500)
  }

  // 检查是否与历史号码重复
  const checkDuplicateNumbers = (): VerificationResult => {
    const recentDraws = historyData.slice(0, 10)

    for (const draw of recentDraws) {
      const frontMatch = arraysEqual(draw.frontNumbers, selectedNumbers.frontNumbers)
      const backMatch = arraysEqual(draw.backNumbers, selectedNumbers.backNumbers)

      if (frontMatch && backMatch) {
        return {
          id: "duplicate",
          name: "重复号码检查",
          passed: false,
          message: `号码组合与第${draw.drawNumber}期完全相同`,
          severity: "high",
        }
      }
    }

    return {
      id: "duplicate",
      name: "重复号码检查",
      passed: true,
      message: "号码组合在最近10期内未出现过",
      severity: "high",
    }
  }

  // 检查连号
  const checkConsecutiveNumbers = (): VerificationResult => {
    const { frontNumbers } = selectedNumbers
    const sortedNumbers = [...frontNumbers].sort((a, b) => a - b)

    let maxConsecutive = 1
    let currentConsecutive = 1

    for (let i = 1; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] === sortedNumbers[i - 1] + 1) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 1
      }
    }

    const passed = maxConsecutive < 3

    return {
      id: "consecutive",
      name: "连号检查",
      passed,
      message: passed ? "号码不存在3个以上的连续号码" : `存在${maxConsecutive}个连续号码，可能降低中奖概率`,
      severity: "medium",
    }
  }

  // 检查奇偶比例
  const checkOddEvenRatio = (): VerificationResult => {
    const { frontNumbers } = selectedNumbers

    const oddCount = frontNumbers.filter((num) => num % 2 === 1).length
    const evenCount = frontNumbers.length - oddCount
    const ratio = oddCount / frontNumbers.length

    const passed = ratio >= 0.3 && ratio <= 0.7

    return {
      id: "oddEven",
      name: "奇偶比例",
      passed,
      message: passed
        ? `奇偶比例平衡 (${oddCount}:${evenCount})`
        : `奇偶比例不平衡 (${oddCount}:${evenCount})，建议调整`,
      severity: "low",
    }
  }

  // 检查冷热号平衡
  const checkHotColdBalance = (): VerificationResult => {
    // 简化版实现，实际应该基于历史数据分析冷热号
    const { frontNumbers } = selectedNumbers

    // 假设1-12为热号，24-35为冷号
    const hotNumbers = frontNumbers.filter((num) => num <= 12).length
    const coldNumbers = frontNumbers.filter((num) => num >= 24).length

    const passed = hotNumbers <= 3 && coldNumbers <= 3

    return {
      id: "hotCold",
      name: "冷热号平衡",
      passed,
      message: passed ? "冷热号分布平衡" : `冷热号分布不平衡 (热号:${hotNumbers}, 冷号:${coldNumbers})`,
      severity: "medium",
    }
  }

  // 检查和值范围
  const checkSumRange = (): VerificationResult => {
    const { frontNumbers } = selectedNumbers

    const sum = frontNumbers.reduce((acc, num) => acc + num, 0)
    const passed = sum >= 60 && sum <= 140

    return {
      id: "sumRange",
      name: "和值范围",
      passed,
      message: passed ? `和值在合理范围内 (${sum})` : `和值${sum}超出理想范围60-140`,
      severity: "medium",
    }
  }

  // 检查跨度
  const checkSpan = (): VerificationResult => {
    const { frontNumbers } = selectedNumbers

    const min = Math.min(...frontNumbers)
    const max = Math.max(...frontNumbers)
    const span = max - min

    const passed = span <= 30

    return {
      id: "span",
      name: "跨度检查",
      passed,
      message: passed ? `跨度在合理范围内 (${span})` : `跨度${span}过大，超出30`,
      severity: "low",
    }
  }

  // 辅助函数：检查两个数组是否相等
  const arraysEqual = (a: number[], b: number[]): boolean => {
    if (a.length !== b.length) return false

    const sortedA = [...a].sort((x, y) => x - y)
    const sortedB = [...b].sort((x, y) => x - y)

    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false
    }

    return true
  }

  // 计算通过的规则数量
  const passedCount = results.filter((result) => result.passed).length
  const totalCount = results.length
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>号码验证</CardTitle>
        <CardDescription>验证所选号码是否符合规则要求</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">当前选择的号码</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-2">前区:</span>
                  {selectedNumbers.frontNumbers.map((num) => (
                    <div
                      key={`front-${num}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-1"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground mr-2">后区:</span>
                  {selectedNumbers.backNumbers.map((num) => (
                    <div
                      key={`back-${num}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-1"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={runVerification} disabled={isVerifying}>
              {isVerifying ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? "验证中..." : "验证号码"}
            </Button>
          </div>

          {verified && (
            <Alert
              className={
                passRate >= 80
                  ? "bg-green-50 border-green-200"
                  : passRate >= 50
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>验证结果</AlertTitle>
              <AlertDescription>
                通过了 {passedCount}/{totalCount} 项验证规则 ({passRate}%)
              </AlertDescription>
            </Alert>
          )}

          {verified && results.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="font-medium mb-2">详细验证结果:</h3>
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border flex items-start ${
                    result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="mr-3 mt-0.5">
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{result.name}</h4>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          result.severity === "high"
                            ? "border-red-200 text-red-700"
                            : result.severity === "medium"
                              ? "border-yellow-200 text-yellow-700"
                              : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {result.severity === "high" ? "高" : result.severity === "medium" ? "中" : "低"}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
