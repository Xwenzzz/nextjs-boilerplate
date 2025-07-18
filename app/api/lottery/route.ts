import { NextResponse } from "next/server"
import type { LotteryDraw } from "@/types/lottery"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedCount = Number.parseInt(searchParams.get("count") || "50")
    const maxPerRequest = 20 // API单次最大返回数量
    const totalBatches = Math.ceil(requestedCount / maxPerRequest)

    console.log(`请求获取 ${requestedCount} 期数据，需要 ${totalBatches} 次API调用`)

    const apiKey = "00d0552102a8728f"
    let allData: LotteryDraw[] = []

    // 分批获取数据
    for (let batch = 0; batch < totalBatches; batch++) {
      const start = batch * maxPerRequest
      const num = Math.min(maxPerRequest, requestedCount - start)

      const url = `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=14&issueno=&start=${start}&num=${num}`

      console.log(`第 ${batch + 1}/${totalBatches} 批请求:`, url)

      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          console.warn(`第 ${batch + 1} 批请求失败: ${response.status}`)
          continue
        }

        const responseText = await response.text()
        const result = JSON.parse(responseText)

        if (result.status !== 0) {
          console.warn(`第 ${batch + 1} 批API错误: ${result.msg}`)
          continue
        }

        const batchData = transformJisuApiData(result.result)
        allData = [...allData, ...batchData]

        console.log(`第 ${batch + 1} 批获取到 ${batchData.length} 条数据`)

        // 添加延迟避免API限流
        if (batch < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`第 ${batch + 1} 批请求异常:`, error)
        continue
      }
    }

    // 去重并按期号排序
    const uniqueData = removeDuplicates(allData)
    const sortedData = uniqueData.sort((a, b) => {
      const aNum = Number.parseInt(a.drawNumber.replace(/\D/g, ""))
      const bNum = Number.parseInt(b.drawNumber.replace(/\D/g, ""))
      return bNum - aNum // 降序排列，最新的在前
    })

    console.log(`总共获取到 ${sortedData.length} 期有效数据`)

    return NextResponse.json({
      success: true,
      data: sortedData,
      message: `成功获取${sortedData.length}期开奖数据`,
      totalRequested: requestedCount,
      totalBatches,
    })
  } catch (error) {
    console.error("获取API数据失败", error)
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

// 去重函数
function removeDuplicates(data: LotteryDraw[]): LotteryDraw[] {
  const seen = new Set<string>()
  return data.filter((item) => {
    if (seen.has(item.drawNumber)) {
      return false
    }
    seen.add(item.drawNumber)
    return true
  })
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
