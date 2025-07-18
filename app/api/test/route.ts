import { NextResponse } from "next/server"

// 用于测试直接API调用
export async function GET() {
  try {
    // 使用极速数据API获取大乐透历史数据
    const apiKey = "00d0552102a8728f" // 极速数据API密钥

    // 根据文档，直接使用完整URL进行测试
    const url = `https://api.jisuapi.com/caipiao/history?appkey=${apiKey}&caipiaoid=13&issueno=&start=0&num=10`

    console.log("测试请求URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    // 记录完整的响应信息
    const responseText = await response.text()

    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      parsedResponse = null
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      responseText: responseText.substring(0, 1000), // 限制长度以防止过大
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
