"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts"
import { Loader2, AlertTriangle, TrendingUp, Users, MapPin } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/newChart"
import { sections, calculateLSAr, getColorCoding } from "@/lib/survey-data"
import { nigerianStates } from "@/lib/nigeria-data"

interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
}

export default function LocalAnalysisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lgaScores, setLgaScores] = useState<LGAScore[]>([])
  const [selectedState, setSelectedState] = useState<string>("All States")
  const [selectedSection, setSelectedSection] = useState<string>("decision-making")
  const [activeTab, setActiveTab] = useState("lsar")
  const [filteredLGAs, setFilteredLGAs] = useState<LGAScore[]>([])

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
    } else {
      fetchLGAScores()
    }
  }, [router])

  // Fetch LGA scores
  const fetchLGAScores = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = new URL("/api/analysis/lga-scores", window.location.origin)

      const response = await fetch(url.toString())

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || "Failed to fetch LGA scores")
      }

      const data = await response.json()
      setLgaScores(data)
      setFilteredLGAs(data)
    } catch (error: any) {
      console.error("Error fetching LGA scores:", error)
      setError(error.message || "Failed to fetch LGA scores. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Filter LGAs by state
  useEffect(() => {
    if (lgaScores.length > 0) {
      if (selectedState === "All States") {
        setFilteredLGAs(lgaScores)
      } else {
        const filtered = lgaScores.filter((item) => item.state === selectedState)
        setFilteredLGAs(filtered)
      }
    }
  }, [selectedState, lgaScores])

  const lsarChartData = filteredLGAs.map((item) => {
    const lsarScore = calculateLSAr(item.averageScores)
    const colorCoding = getColorCoding(lsarScore)
    return {
      lga: `${item.lga} (${item.state})`,
      lsarScore,
      color: colorCoding.color,
      label: colorCoding.label,
      count: item.count,
    }
  })

  // Prepare data for section chart
  const sectionChartData = filteredLGAs.map((item) => ({
    lga: `${item.lga} (${item.state})`,
    score: item.averageScores[selectedSection] || 0,
    count: item.count,
  }))

  // Get section display name
  const getSectionDisplayName = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    return section ? section.title : sectionId
  }

  // Get all section names
  const sectionNames = sections.map((section) => section.title)

  // Get all state names plus "All States" option
  const stateNames = ["All States", ...nigerianStates.map((state) => state.name)]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 text-center">Local Government Analysis</h1>
            <p className="text-slate-600 dark:text-slate-300 text-center text-lg">
              Comprehensive LSAr analysis across Nigerian local government areas
            </p>

            {/* Summary Cards */}
            {!loading && !error && filteredLGAs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">LGAs Analyzed</p>
                        <p className="text-2xl font-bold">{filteredLGAs.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Surveys</p>
                        <p className="text-2xl font-bold">{filteredLGAs.reduce((sum, lga) => sum + lga.count, 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg LSAr Score</p>
                        <p className="text-2xl font-bold">
                          {(
                            filteredLGAs.reduce((sum, lga) => sum + calculateLSAr(lga.averageScores), 0) /
                            filteredLGAs.length
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="lsar">LSAr Analysis</TabsTrigger>
              <TabsTrigger value="section">Section Analysis</TabsTrigger>
              <TabsTrigger value="comparison">Multi-Section View</TabsTrigger>
            </TabsList>

            <TabsContent value="lsar">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Local Government LSAr Scores
                    <Badge variant="outline">Weighted Rating</Badge>
                  </CardTitle>
                  <CardDescription>Compare Local Security Architecture ratings across LGAs</CardDescription>
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-1 block">Select State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateNames.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Loading security data...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : filteredLGAs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 dark:text-slate-400">
                        No data available. Complete surveys to see analysis.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        lsarScore: {
                          label: "LSAr Score (%)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[600px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={lsarChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            label={{ value: "LSAr Score (%)", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis type="category" dataKey="lga" width={200} tick={{ fontSize: 12 }} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name, props) => {
                                  if (name === "lsarScore") {
                                    const data = props.payload
                                    return [
                                      <div key="tooltip" className="space-y-1">
                                        <p className="font-medium">{`${value.toFixed(1)}%`}</p>
                                        <p className="text-sm" style={{ color: data.color }}>
                                          {data.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {data.count} survey{data.count !== 1 ? "s" : ""}
                                        </p>
                                      </div>,
                                    ]
                                  }
                                  return [value, name]
                                }}
                              />
                            }
                          />
                          <Bar dataKey="lsarScore" name="LSAr Score" radius={[0, 4, 4, 0]}>
                            {lsarChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="section">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Section Analysis</CardTitle>
                  <CardDescription>Compare specific security dimensions across LGAs</CardDescription>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select State</label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateNames.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Select Section</label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Loading security data...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : filteredLGAs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 dark:text-slate-400">
                        No data available. Complete surveys to see analysis.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        score: {
                          label: "Section Score (%)",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[600px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sectionChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            label={{ value: "Score (%)", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis type="category" dataKey="lga" width={200} tick={{ fontSize: 12 }} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name, props) => {
                                  if (name === "score")
                                    return [`${value.toFixed(1)}%`, getSectionDisplayName(selectedSection)]
                                  return [value, name]
                                }}
                              />
                            }
                          />
                          <Bar dataKey="score" name="Section Score" fill="var(--color-score)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Multi-Section Comparison</CardTitle>
                  <CardDescription>Compare all security dimensions across selected LGAs</CardDescription>
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-1 block">Select State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateNames.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">Loading security data...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : filteredLGAs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500 dark:text-slate-400">
                        No data available. Complete surveys to see analysis.
                      </p>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        "decision-making": {
                          label: "Decision Making",
                          color: "#8B5CF6",
                        },
                        instruments: {
                          label: "Security Instruments",
                          color: "#F97316",
                        },
                        intelligence: {
                          label: "Intelligence & Early Warning",
                          color: "#3B82F6",
                        },
                        resources: {
                          label: "Dedicated Resources",
                          color: "#EAB308",
                        },
                        institutions: {
                          label: "Security Institutions",
                          color: "#EF4444",
                        },
                        evaluation: {
                          label: "Performance Evaluation",
                          color: "#10B981",
                        },
                      }}
                      className="h-[600px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredLGAs.map((item) => ({
                            lga: `${item.lga} (${item.state})`,
                            "decision-making": item.averageScores["decision-making"] || 0,
                            instruments: item.averageScores["instruments"] || 0,
                            intelligence: item.averageScores["intelligence"] || 0,
                            resources: item.averageScores["resources"] || 0,
                            institutions: item.averageScores["institutions"] || 0,
                            evaluation: item.averageScores["evaluation"] || 0,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            label={{ value: "Score (%)", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis type="category" dataKey="lga" width={200} tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="decision-making" name="Decision Making" fill="var(--color-decision-making)" />
                          <Bar dataKey="instruments" name="Security Instruments" fill="var(--color-instruments)" />
                          <Bar
                            dataKey="intelligence"
                            name="Intelligence & Early Warning"
                            fill="var(--color-intelligence)"
                          />
                          <Bar dataKey="resources" name="Dedicated Resources" fill="var(--color-resources)" />
                          <Bar dataKey="institutions" name="Security Institutions" fill="var(--color-institutions)" />
                          <Bar dataKey="evaluation" name="Performance Evaluation" fill="var(--color-evaluation)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              Analysis based on Local Security Architecture (LSAr) framework. Last updated:{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
