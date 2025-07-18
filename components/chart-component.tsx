"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AlertTriangle } from "lucide-react"

interface ChartComponentProps {
  data: Array<Record<string, any>>
  xKey: string
  yKey: string
  xLabel: string
  yLabel: string
  name: string
}

export function ChartComponent({ data, xKey, yKey, xLabel, yLabel, name }: ChartComponentProps) {
  // 确保数据有效
  const safeData = Array.isArray(data) && data.length > 0 ? data : [{ [xKey]: 0, [yKey]: 0 }]

  try {
    return (
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} label={{ value: xLabel, position: "insideBottom", offset: -5 }} />
            <YAxis domain={[0, 100]} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey={yKey} stroke="#8884d8" activeDot={{ r: 8 }} name={name} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  } catch (error) {
    console.error("渲染图表时出错:", error)
    return (
      <div className="flex items-center justify-center h-full border border-dashed rounded-md">
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-muted-foreground">图表渲染失败</p>
        </div>
      </div>
    )
  }
}
