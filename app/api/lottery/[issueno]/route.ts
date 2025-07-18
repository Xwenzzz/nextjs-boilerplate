import { NextResponse } from "next/server"
import type { LotteryDraw } from "@/types/lottery"

export async function GET(request: Request, { params }: { params: { issueno: string } }) {
  try {
    const issueno = params.issueno

    if (!issueno) {
      return NextResponse.json(
        {
          success: false,
          error: "期号不能为空",
        },
        { status: 400 },
      )
    }

    console.log(`正在查询期号: ${issueno}`)

    // 使用极速数据API获取特定期号的大乐透数据
    const apiKey = "00d0552102a8728f" // 极速数据API密钥

    // 根据极速数据官方文档，大乐透的caipiaoid是14
    const url = `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=14&issueno=${issueno}`

    console.log("请求单期API URL:", url)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // 禁用缓存，确保获取最新数据
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    // 获取原始响应文本用于调试
    const responseText = await response.text()
    console.log("API原始响应:", responseText.substring(0, 500) + "...")

    // 解析JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("解析API响应JSON失败:", e)
      throw new Error("API响应格式错误")
    }

    // 检查API返回状态
    if (result.status !== 0) {
      throw new Error(`API错误: ${result.msg || "未知错误"}`)
    }

    // 检查是否有数据
    if (!result.result || !result.result.list || result.result.list.length === 0) {
      throw new Error(`未找到期号为 ${issueno} 的开奖数据`)
    }

    // 找到匹配的期号
    const matchingDraw = result.result.list.find((item: any) => item.issueno === issueno)

    if (!matchingDraw) {
      throw new Error(`未找到期号为 ${issueno} 的开奖数据`)
    }

    // 转换API返回的数据
    const data = transformSingleDraw(matchingDraw)

    if (!data) {
      throw new Error(`未找到期号为 ${issueno} 的开奖数据`)
    }

    return NextResponse.json({
      success: true,
      data,
      message: `成功获取期号 ${issueno} 的开奖数据`,
    })
  } catch (error) {
    console.error("获取单期数据失败", error)
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

// 转换单期开奖数据
function transformSingleDraw(apiData: any): LotteryDraw | null {
  try {
    // 检查API返回的数据结构
    if (!apiData) {
      console.error("API返回数据结构错误:", JSON.stringify(apiData))
      return null
    }

    // 提取期号和日期
    const drawNumber = apiData.issueno || ""
    const drawDate = apiData.opendate || ""

    // 解析前区号码 (number字段)
    let frontNumbers: number[] = []
    if (apiData.number && typeof apiData.number === "string") {
      frontNumbers = apiData.number
        .trim()
        .split(/\s+/)
        .map((n: string) => Number.parseInt(n.trim(), 10))
        .filter((n: number) => !isNaN(n))
    }

    // 解析后区号码 (refernumber字段)
    let backNumbers: number[] = []
    if (apiData.refernumber && typeof apiData.refernumber === "string") {
      backNumbers = apiData.refernumber
        .trim()
        .split(/\s+/)
        .map((n: string) => Number.parseInt(n.trim(), 10))
        .filter((n: number) => !isNaN(n))
    }

    // 验证解析结果
    if (frontNumbers.length !== 5 || backNumbers.length !== 2) {
      console.warn(`期号 ${drawNumber} 号码解析不完整 - 前区: ${frontNumbers.length}/5, 后区: ${backNumbers.length}/2`)
      return null
    }

    // 处理奖金信息
    let prizeStr = "未知"
    if (apiData.totalmoney) {
      prizeStr = `${apiData.totalmoney}元`
    }

    // 处理销售额
    let salesStr = "未知"
    if (apiData.saleamount) {
      const saleAmount = Number.parseFloat(String(apiData.saleamount))
      if (!isNaN(saleAmount)) {
        salesStr = formatCurrency(saleAmount)
      } else {
        salesStr = String(apiData.saleamount)
      }
    }

    // 创建转换后的数据对象
    return {
      drawNumber,
      drawDate,
      frontNumbers,
      backNumbers,
      prize: prizeStr,
      sales: salesStr,
    }
  } catch (error) {
    console.error("数据转换过程中发生错误:", error)
    return null
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
