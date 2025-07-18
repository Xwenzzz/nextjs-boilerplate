"use client"

import { motion } from "framer-motion"
import LotteryBall from "./lottery-ball"

export interface NumberCombinationProps {
  frontNumbers: number[]
  backNumbers: number[]
  animated?: boolean
  size?: "sm" | "md" | "lg"
  highlightedNumbers?: number[]
}

export default function NumberCombination({
  frontNumbers,
  backNumbers,
  animated = false,
  size = "md",
  highlightedNumbers = [],
}: NumberCombinationProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {animated ? (
        <motion.div className="flex flex-wrap gap-1 sm:gap-2" variants={container} initial="hidden" animate="show">
          {frontNumbers.map((num, index) => (
            <LotteryBall
              key={`front-${index}`}
              number={num}
              type="front"
              size={size}
              animated={animated}
              highlighted={highlightedNumbers.includes(num)}
            />
          ))}

          <span className="mx-1 font-bold text-muted-foreground self-center">|</span>

          {backNumbers.map((num, index) => (
            <LotteryBall
              key={`back-${index}`}
              number={num}
              type="back"
              size={size}
              animated={animated}
              highlighted={highlightedNumbers.includes(num)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {frontNumbers.map((num, index) => (
            <LotteryBall
              key={`front-${index}`}
              number={num}
              type="front"
              size={size}
              highlighted={highlightedNumbers.includes(num)}
            />
          ))}

          <span className="mx-1 font-bold text-muted-foreground self-center">|</span>

          {backNumbers.map((num, index) => (
            <LotteryBall
              key={`back-${index}`}
              number={num}
              type="back"
              size={size}
              highlighted={highlightedNumbers.includes(num)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
