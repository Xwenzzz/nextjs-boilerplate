"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ApiTester() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testApi = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-lottery")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("API测试失败", error)
      setResult({ error: error instanceof Error ? error.message : "未知错误" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API测试工具</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testApi} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          测试API
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">测试结果</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
