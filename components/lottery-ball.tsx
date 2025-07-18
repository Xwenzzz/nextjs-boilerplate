"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface LotteryBallProps {
  number: number
  type: "front" | "back" | "red" | "blue" // Added "red" and "blue" for clarity
  size?: "sm" | "md" | "lg"
  highlighted?: boolean
  animated?: boolean
}

export default function LotteryBall({
  number,
  type,
  size = "md",
  highlighted = false,
  animated = false,
}: LotteryBallProps) {
  // 根据号码类型确定颜色
  const colorClass =
    type === "front" || type === "red"
      ? "bg-gradient-to-br from-red-500 to-red-600"
      : "bg-gradient-to-br from-blue-500 to-blue-600"

  // 根据尺寸确定大小
  const sizeClass = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  }[size]

  // 高亮样式
  const highlightClass = highlighted ? "ring-2 ring-yellow-400 ring-offset-1" : ""

  // 确保号码格式化为两位数
  const formattedNumber = String(number).padStart(2, "0")

  // 如果使用动画
  if (animated) {
    return (
      <motion.div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shadow-md text-white",
          colorClass,
          sizeClass,
          highlightClass,
        )}
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.5, delay: number * 0.05 }}
        whileHover={{ scale: 1.1, y: -2 }}
      >
        {formattedNumber}
      </motion.div>
    )
  }

  // 不使用动画的渲染
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shadow-md text-white transition-all hover:scale-110",
        colorClass,
        sizeClass,
        highlightClass,
      )}
    >
      {formattedNumber}
    </div>
  )
}
