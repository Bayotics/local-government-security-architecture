"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Shield, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { nigerianStates, nigerianLGAs } from "@/lib/nigeria-data"

export default function LGALogin() {
  const router = useRouter()
  const [step, setStep] = useState<"select" | "otp">("select")
  const [selectedState, setSelectedState] = useState("")
  const [selectedLGA, setSelectedLGA] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [maskedPhone, setMaskedPhone] = useState("")

  const filteredLGAs = selectedState
    ? nigerianLGAs.filter((lga) => lga.state_id === Number.parseInt(selectedState))
    : []

  const handleSelectLGA = async () => {
    if (!selectedState || !selectedLGA) {
      setError("Please select both state and LGA")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if LGA exists in whitelist
      const checkResponse = await fetch("/api/auth/check-lga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId: selectedState, lgaId: selectedLGA }),
      })

      if (!checkResponse.ok) {
        const data = await checkResponse.json()
        throw new Error(data.error || "LGA not found")
      }

      // Send OTP
      const otpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateId: selectedState, lgaId: selectedLGA }),
      })

      if (!otpResponse.ok) {
        const data = await otpResponse.json()
        throw new Error(data.error || "Failed to send OTP")
      }

      const otpData = await otpResponse.json()
      setMaskedPhone(otpData.phone)
      setStep("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: selectedState,
          lgaId: selectedLGA,
          otp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP")
      }

      // Store session and location data
      localStorage.setItem("sessionId", data.sessionId)
      localStorage.setItem("lgaName", data.lgaName)
      localStorage.setItem("stateName", data.stateName)
      localStorage.setItem("isAuthenticated", "true")

      localStorage.setItem("selectedState", data.stateName)
      localStorage.setItem("selectedLga", data.lgaName)
      localStorage.setItem("preSelectedStateId", data.stateId.toString())
      localStorage.setItem("preSelectedLgaId", data.lgaId.toString())

      // Redirect to survey
      router.push("/select-location")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">LGA Official Access</h1>
          <p className="text-muted-foreground mt-2">Secure authentication for local government officials</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-effect border-primary/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {step === "select" ? "Select Your LGA" : "Enter OTP"}
              </CardTitle>
              <CardDescription>
                {step === "select" ? "Choose your state and local government" : `Enter the OTP sent to ${maskedPhone}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === "select" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lga">Local Government</Label>
                    <Select value={selectedLGA} onValueChange={setSelectedLGA} disabled={!selectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredLGAs.map((lga) => (
                          <SelectItem key={lga.id} value={lga.id.toString()}>
                            {lga.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  <Button variant="link" onClick={() => setStep("select")} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to LGA Selection
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={step === "select" ? handleSelectLGA : handleVerifyOTP}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : step === "select" ? (
                  "Send OTP"
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
