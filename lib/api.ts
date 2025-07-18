import type { LotteryDraw } from "@/types/lottery"

// 添加重试机制
export async function fetchLotteryData(retryCount = 3): Promise<LotteryDraw[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      // 添加时间戳防止缓存
      const timestamp = new Date().getTime()
      // 使用我们自己的API路由来获取数据，避免CORS问题
      const response = await fetch(`/api/lottery?t=${timestamp}`, {
        cache: "no-store", // 禁用缓存，确保获取最新数据
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const result = await response.json()

      // 检查API返回状态
      if (!result.success) {
        throw new Error(result.message || "获取数据失败")
      }

      // 获取转换后的数据
      const data = result.data

      // 验证数据格式
      const validData = validateLotteryData(data)

      // 保存到本地存储作为缓存
      if (validData.length > 0) {
        saveToLocalStorage(validData)
      }

      return validData
    } catch (error) {
      console.error(`获取API数据失败 (尝试 ${attempt + 1}/${retryCount})`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      // 最后一次尝试失败，尝试从本地存储获取
      if (attempt === retryCount - 1) {
        // 如果API调用失败，尝试从本地存储获取
        const localData = getLocalStorageData()
        if (localData && localData.length > 0) {
          console.log("使用本地缓存数据")
          return localData
        }

        // 如果本地也没有数据，返回模拟数据
        console.log("使用模拟数据")
        return generateMockData(50) // 确保生成50期模拟数据
      }

      // 等待一段时间后重试
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  // 这行代码理论上不会执行，但为了类型安全添加
  return generateMockData(50)
}

// 验证彩票数据
function validateLotteryData(data: any[]): LotteryDraw[] {
  if (!Array.isArray(data)) return []

  return data.filter((item) => {
    // 基本结构检查
    if (!item || typeof item !== "object") return false

    // 检查必要字段
    if (!item.drawNumber || !item.drawDate) return false

    // 检查前区号码
    if (!Array.isArray(item.frontNumbers) || item.frontNumbers.length !== 5) return false

    // 检查后区号码
    if (!Array.isArray(item.backNumbers) || item.backNumbers.length !== 2) return false

    // 确保prize和sales是字符串
    item.prize = typeof item.prize === "string" ? item.prize : "未知"
    item.sales = typeof item.sales === "string" ? item.sales : "未知"

    return true
  })
}

// 更新获取本地存储数据的方法以支持新格式
export function getLocalStorageData(): LotteryDraw[] | null {
  if (typeof window === "undefined") return null

  try {
    const storedData = localStorage.getItem("lotteryData")
    if (!storedData) return null

    let parsedData
    try {
      parsedData = JSON.parse(storedData)
    } catch (e) {
      console.error("解析本地数据失败", e)
      return null
    }

    // 检查是否是新格式（带版本信息）
    if (parsedData && typeof parsedData === "object" && parsedData.version && Array.isArray(parsedData.data)) {
      return validateLotteryData(parsedData.data)
    }
    // 兼容旧格式
    else if (Array.isArray(parsedData)) {
      return validateLotteryData(parsedData)
    }

    return null
  } catch (error) {
    console.error("读取本地数据失败", error)
    return null
  }
}

// 优化本地存储，添加版本控制
export function saveToLocalStorage(data: LotteryDraw[]): void {
  if (typeof window === "undefined") return

  try {
    if (Array.isArray(data) && data.length > 0) {
      // 确保数据按期号排序（最新的在前面）
      const sortedData = [...data].sort((a, b) => {
        const aNum = Number.parseInt(a.drawNumber.replace(/\D/g, ""), 10)
        const bNum = Number.parseInt(b.drawNumber.replace(/\D/g, ""), 10)

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return bNum - aNum
        }

        return new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
      })

      // 只保留最新的50期数据
      const limitedData = sortedData.slice(0, 50)

      // 添加版本信息和时间戳
      const storageData = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        data: limitedData,
      }

      localStorage.setItem("lotteryData", JSON.stringify(storageData))
    }
  } catch (error) {
    console.error("保存数据到本地失败", error)
  }
}

// 清除本地存储
export function clearLocalStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("lotteryData")
    console.log("本地缓存已清除")
  } catch (error) {
    console.error("清除本地缓存失败", error)
  }
}

// 生成模拟数据
export function generateMockData(count: number): LotteryDraw[] {
  if (!count || count <= 0) {
    return []
  }

  const data: LotteryDraw[] = []
  const defaultCount = Math.max(count, 50) // 确保至少生成50期数据

  for (let i = defaultCount; i > 0; i--) {
    // 生成日期，从今天往前推
    const date = new Date()
    date.setDate(date.getDate() - i * 3)
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    // 生成前区号码（5个，1-35）
    const frontNumbers = generateUniqueRandomNumbers(5, 1, 35).sort((a, b) => a - b)

    // 生成后区号码（2个，1-12）
    // 确保后区号码与前区不重复
    const backNumbers: number[] = []
    while (backNumbers.length < 2) {
      const num = Math.floor(Math.random() * 12) + 1
      if (!frontNumbers.includes(num) && !backNumbers.includes(num)) {
        backNumbers.push(num)
      }
    }
    backNumbers.sort((a, b) => a - b)

    // 生成奖金和销售额
    const prize = (Math.random() * 100000000).toFixed(0)
    const sales = (Math.random() * 500000000).toFixed(0)

    // 生成期号，使用真实的年份
    const year = date.getFullYear().toString().slice(-2)
    const drawNumber = `${year}${String(i).padStart(3, "0")}`

    data.push({
      drawNumber,
      drawDate: formattedDate,
      frontNumbers,
      backNumbers,
      prize: formatCurrency(Number(prize)),
      sales: formatCurrency(Number(sales)),
    })
  }

  return data
}

function generateUniqueRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers: number[] = []
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers
}

function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿元`
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万元`
  } else {
    return `${value.toFixed(2)}元`
  }
}

// 批量导入数据
export async function batchImportData(batchSize = 10, maxBatches = 5): Promise<LotteryDraw[]> {
  let allData: LotteryDraw[] = []
  const currentData = getLocalStorageData() || []

  // 如果已有数据，先加入
  if (currentData.length > 0) {
    allData = [...currentData]
  }

  // 最多获取maxBatches批数据
  for (let batch = 0; batch < maxBatches && allData.length < 50; batch++) {
    try {
      const start = batch * batchSize
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/lottery/batch?start=${start}&num=${batchSize}&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`批量导入失败: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "批量导入数据格式错误")
      }

      // 验证并合并数据
      const validBatchData = validateLotteryData(result.data)

      // 合并数据，避免重复
      const newData = validBatchData.filter(
        (newItem) => !allData.some((existingItem) => existingItem.drawNumber === newItem.drawNumber),
      )

      allData = [...allData, ...newData]

      // 如果返回的数据少于请求的数量，说明没有更多数据了
      if (validBatchData.length < batchSize) {
        break
      }
    } catch (error) {
      console.error(`批量导入第${batch + 1}批数据失败`, error)
      break
    }
  }

  // 保存合并后的数据
  if (allData.length > 0) {
    saveToLocalStorage(allData)
  }

  return allData
}
