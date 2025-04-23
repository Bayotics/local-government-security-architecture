"use client"

import type React from "react"

import type { FC } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useEffect } from "react"

const Home: FC = () => {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Simple timeout to simulate verification
    setTimeout(() => {
      if (accessCode === "12345678") {
        // Store authentication state in localStorage
        localStorage.setItem("isAuthenticated", "true")
        setIsAuthenticated(true)
        // Redirect to location selection
        router.push("/select-location")
      } else {
        setError("Invalid access code. Please try again.")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png?height=80&width=80"
                alt="Nigeria Security Survey Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold">Nigeria Security Awareness Survey</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Assess and improve security across local governments
            </p>
          </div>

          {!isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Access Required</CardTitle>
                <CardDescription>Enter your access code to continue</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="accessCode">Access Code</Label>
                      <Input
                        id="accessCode"
                        type="password"
                        placeholder="Enter your access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {isAuthenticated && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Choose an option to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => {
                      // Clear previous survey data
                      localStorage.removeItem("surveyAnswers")
                      localStorage.removeItem("currentSectionIndex")
                      router.push("/select-location")
                    }}
                    className="w-full"
                  >
                    Start New Survey
                  </Button>
                  <Button onClick={() => router.push("/analysis")} variant="outline" className="w-full">
                    View Analysis Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
