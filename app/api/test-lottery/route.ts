import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 使用极速数据API获取大乐透历史数据
    const apiKey = "00d0552102a8728f" // 极速数据API密钥
    const url = `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=14&issueno=&start=0&num=1`

    console.log("测试API URL:", url)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })

    // 获取原始响应文本
    const responseText = await response.text()

    // 尝试解析JSON
    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      parsedResponse = null
    }

    // 返回完整的响应信息
    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      responseText: responseText.substring(0, 2000), // 限制长度
      parsedResponse,
    })
  } catch (error) {
    console.error("测试API失败", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
