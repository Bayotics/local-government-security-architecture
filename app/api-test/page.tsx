"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ApiTestPage() {
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult("")

      const response = await fetch("/api/test", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "API test failed")
      }

      setResult(data.result)
    } catch (err: any) {
      setError(err.message || "An error occurred during the API test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI API Test</CardTitle>
            <CardDescription>Test if the OpenAI API is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            ) : result ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                <p className="font-medium">Success:</p>
                <p>{result}</p>
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400">
                Click the button below to test the OpenAI API connection
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testApi} className="w-full" disabled={loading}>
              Test OpenAI API
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
