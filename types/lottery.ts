// 彩票开奖数据类型
export interface LotteryDraw {
  drawNumber: string // 期号
  drawDate: string // 开奖日期
  frontNumbers: number[] // 前区号码
  backNumbers: number[] // 后区号码
  prize: string // 奖金
  sales: string // 销售额
}

// 号码频率类型
export interface NumberFrequency {
  number: number
  frequency: number
  percentage: number
  isHot: boolean
}

// 跨度数据类型
export interface SpanData {
  span: number
  count: number
  percentage: number
}
