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
import { AlertCircle, Loader2, Shield, TrendingUp, Lock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useEffect } from "react"
import { motion } from "framer-motion"

const SurveyAccess: FC = () => {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    setTimeout(() => {
      if (accessCode === "12345678") {
        localStorage.setItem("isAuthenticated", "true")
        setIsAuthenticated(true)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              className="flex justify-center mb-4"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <Image
                  src="/logo.png?height=80&width=80"
                  alt="Nigeria Security Survey Logo"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-normal gradient-text mb-2">Nigeria Security Assessment Survey</h1>
            <p className="text-muted-foreground mt-2 text-lg">Assess and improve security across local governments</p>
          </motion.div>

          {!isAuthenticated && (
            <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: 0.2 }}
>
  {/* OUTER WRAPPER just like the button */}
  <div className="relative p-[2px] rounded-2xl overflow-hidden">

    {/* Rotating gradient border */}
    {/* 💡 CHANGE: Set z-index to a low value (e.g., z-10) */}
    <motion.div
      className="absolute inset-0 rounded-2xl z-10" 
      animate={{ rotate: 360 }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        background:
          "bg-white ",
        filter: "blur(1px)",
      }}
    />

    {/* MASK LAYER (This must now be ON TOP of the gradient) */}
    {/* 💡 CHANGE: Increase z-index to be higher than the gradient (e.g., z-20) */}
    <div className="absolute inset-[3px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 z-22" /> 

    {/* REAL CARD CONTENT (This must be on top of everything) */}
    {/* 💡 OPTIONAL: Ensure this is the highest z-index if needed (e.g., z-30) */}
    <Card className="relative z-30 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary font-thin" />
          Access Required
        </CardTitle>
        <CardDescription>Enter your access code to continue</CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
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
                className="border-primary/30 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full relative overflow-hidden group"
            disabled={isLoading}
          >
            <span className="relative z-10">
              {isLoading ? "Verifying..." : "Continue"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</motion.div>


          )}

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="glass-effect border-primary/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="gradient-text">Welcome Back</CardTitle>
                  <CardDescription>Choose an option to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => {
                      setIsNavigating(true)
                      localStorage.removeItem("surveyAnswers")
                      localStorage.removeItem("currentSectionIndex")
                      router.push("/select-location")
                    }}
                    className="w-full relative overflow-hidden group h-12"
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Survey...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Start New Survey
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-50 transition-opacity" />
                  </Button>
                  <Button
                    onClick={() => router.push("/analysis")}
                    variant="outline"
                    className="w-full h-12 border-primary/30 hover:bg-primary/30 hover:border-primary"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analysis Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default SurveyAccess
