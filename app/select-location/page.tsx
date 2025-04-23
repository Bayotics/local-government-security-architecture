"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { nigerianStates, nigerianLGAs } from "@/lib/nigeria-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"

interface State {
  id: number
  name: string
}

interface LocalGovernment {
  id: number
  name: string
  state_id: number
}

export default function SelectLocation() {
  const router = useRouter()
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LocalGovernment[]>([])
  const [filteredLgas, setFilteredLgas] = useState<LocalGovernment[]>([])
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedLga, setSelectedLga] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const fetchStatesAndLgas = async () => {
      try {
        setLoading(true)

        // Try to fetch from API first
        try {
          // Fetch states
          const statesResponse = await fetch("https://nga-states-lga.onrender.com/fetch", {
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })

          if (statesResponse.ok) {
            const statesData = await statesResponse.json()
            setStates(statesData)
          } else {
            // Fallback to static data
            setStates(nigerianStates)
            console.log("Using fallback state data")
          }

          // Fetch LGAs
          const lgasResponse = await fetch("https://nigeria-states-and-lga.onrender.com/api/lgas", {
            signal: AbortSignal.timeout(5000), // 5 second timeout
          })

          if (lgasResponse.ok) {
            const lgasData = await lgasResponse.json()
            setLgas(lgasData)
          } else {
            // Fallback to static data
            setLgas(nigerianLGAs)
            console.log("Using fallback LGA data")
          }
        } catch (error) {
          // API fetch failed, use fallback data
          console.log("API fetch failed, using fallback data")
          setStates(nigerianStates)
          setLgas(nigerianLGAs)
          setUsingFallbackData(true)
        }
      } catch (error) {
        console.error("Error in location data handling:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatesAndLgas()
  }, [])

  useEffect(() => {
    if (selectedState && lgas.length > 0) {
      const stateId = states.find((state) => state.name === selectedState)?.id
      if (stateId) {
        const filtered = lgas.filter((lga) => lga.state_id === stateId)
        setFilteredLgas(filtered)
      }
    } else {
      setFilteredLgas([])
    }
  }, [selectedState, lgas, states])

  const handleContinue = () => {
    if (selectedState && selectedLga) {
      // Clear previous survey data
      localStorage.removeItem("surveyAnswers")
      localStorage.removeItem("currentSectionIndex")

      // Store selections in localStorage for use throughout the app
      localStorage.setItem("selectedState", selectedState)
      localStorage.setItem("selectedLga", selectedLga)

      // Log to verify values are set
      console.log("Setting localStorage values:", { selectedState, selectedLga })

      // Navigate to survey page
      router.push("/survey")
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Location</CardTitle>
              <CardDescription>Choose your state and local government area</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {usingFallbackData && (
                    <div></div>
                  )}
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.name}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lga">Local Government Area</Label>
                      <Select
                        value={selectedLga}
                        onValueChange={setSelectedLga}
                        disabled={!selectedState || filteredLgas.length === 0}
                      >
                        <SelectTrigger id="lga">
                          <SelectValue placeholder="Select a local government" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredLgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.name}>
                              {lga.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleContinue} className="w-full" disabled={!selectedState || !selectedLga}>
                Continue to Survey
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
