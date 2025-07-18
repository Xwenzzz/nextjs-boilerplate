import { NextResponse } from "next/server"

// 用于调试API的路由
export async function GET() {
  try {
    // 使用极速数据API获取大乐透历史数据
    const apiKey = "00d0552102a8728f" // 极速数据API密钥

    // 尝试获取彩票类型列表，看看大乐透的正确ID是什么
    const response = await fetch(`https://api.jisuapi.com/caipiao/type?appkey=${apiKey}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    // 尝试直接请求一次大乐透数据，看看响应格式
    const lotteryResponse = await fetch(
      `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=14&issueno=&start=0&num=20`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    )

    const lotteryResult = await lotteryResponse.json()

    return NextResponse.json({
      success: true,
      message: "获取彩票类型列表成功",
      typeData: result,
      sampleLotteryData: lotteryResult,
    })
  } catch (error) {
    console.error("调试API失败", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
