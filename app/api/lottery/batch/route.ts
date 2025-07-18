import { NextResponse } from "next/server"
import type { LotteryDraw } from "@/types/lottery"

export async function GET(request: Request) {
  try {
    // 获取URL参数
    const url = new URL(request.url)
    const start = url.searchParams.get("start") || "0"
    const num = url.searchParams.get("num") || "10"

    // 使用极速数据API获取大乐透历史数据
    const apiKey = "00d0552102a8728f" // 极速数据API密钥

    // 根据极速数据官方文档，大乐透的caipiaoid是14
    const apiUrl = `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=14&issueno=&start=${start}&num=${num}`

    console.log("批量请求API URL:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // 禁用缓存，确保获取最新数据
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // 检查API返回状态
    if (result.status !== 0) {
      throw new Error(`API错误: ${result.msg || "未知错误"}`)
    }

    // 转换API返回的数据
    const data = transformJisuApiData(result.result)

    return NextResponse.json({
      success: true,
      data,
      message: `成功获取${data.length}条开奖数据`,
    })
  } catch (error) {
    console.error("批量获取API数据失败", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        message: "获取彩票数据失败，请稍后再试",
      },
      { status: 500 },
    )
  }
}

// 根据官方API格式转换数据
function transformJisuApiData(apiData: any): LotteryDraw[] {
  try {
    // 检查API返回的数据结构
    if (!apiData || !apiData.list || !Array.isArray(apiData.list)) {
      console.error("API返回数据结构错误:", JSON.stringify(apiData))
      return []
    }

    console.log("API返回数据条数:", apiData.list.length)
    if (apiData.list.length > 0) {
      console.log("第一条原始数据示例:", JSON.stringify(apiData.list[0]))
    }

    const transformedData: LotteryDraw[] = []

    // 遍历API返回的每条数据
    for (const item of apiData.list) {
      // 跳过无效数据
      if (!item) continue

      // 提取期号和日期
      const drawNumber = item.issueno || ""
      const drawDate = item.opendate || ""

      // 解析前区号码 (number字段)
      let frontNumbers: number[] = []
      if (item.number && typeof item.number === "string") {
        frontNumbers = item.number
          .trim()
          .split(/\s+/)
          .map((n: string) => Number.parseInt(n.trim(), 10))
          .filter((n: number) => !isNaN(n))
      }

      // 解析后区号码 (refernumber字段)
      let backNumbers: number[] = []
      if (item.refernumber && typeof item.refernumber === "string") {
        backNumbers = item.refernumber
          .trim()
          .split(/\s+/)
          .map((n: string) => Number.parseInt(n.trim(), 10))
          .filter((n: number) => !isNaN(n))
      }

      // 验证解析结果
      if (frontNumbers.length !== 5 || backNumbers.length !== 2) {
        console.warn(
          `期号 ${drawNumber} 号码解析不完整 - 前区: ${frontNumbers.length}/5, 后区: ${backNumbers.length}/2`,
        )
        continue // 跳过不完整的数据
      }

      // 处理奖金信息
      let prizeStr = "未知"
      if (item.totalmoney) {
        prizeStr = `${item.totalmoney}元`
      }

      // 处理销售额
      let salesStr = "未知"
      if (item.saleamount) {
        const saleAmount = Number.parseFloat(String(item.saleamount))
        if (!isNaN(saleAmount)) {
          salesStr = formatCurrency(saleAmount)
        } else {
          salesStr = String(item.saleamount)
        }
      }

      // 创建转换后的数据对象
      const transformedItem: LotteryDraw = {
        drawNumber,
        drawDate,
        frontNumbers,
        backNumbers,
        prize: prizeStr,
        sales: salesStr,
      }

      console.log(`期号 ${drawNumber} 转换结果:`, JSON.stringify(transformedItem))
      transformedData.push(transformedItem)
    }

    console.log(`共转换 ${transformedData.length} 条数据`)
    return transformedData
  } catch (error) {
    console.error("数据转换过程中发生错误:", error)
    return []
  }
}

// 格式化货币
function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿元`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万元`
  } else {
    return `${value.toFixed(2)}元`
  }
}
