import ApiTester from "@/components/api-tester"

export default function TestPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">API测试页面</h1>
      <ApiTester />
    </main>
  )
}
