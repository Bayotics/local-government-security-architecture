"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from "recharts"
import { Loader2, AlertTriangle, TrendingUp, Users, MapPin } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/newChart"
import { sections, colorCoding } from "@/lib/survey-data"

interface StateScore {
  state: string
  count: number
  averageScores: {
    [key: string]: number
  }
  lsarScore: number
  colorCoding: {
    code: string
    color: string
    label: string
  }
}

export default function AnalysisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stateScores, setStateScores] = useState<StateScore[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("decision-making")
  const [activeTab, setActiveTab] = useState("lsar")

  useEffect(() => {
    checkAuth()
    fetchStateScores()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check-auth")
      const { isAdmin } = await response.json()
      if (!isAdmin) {
        router.push("/admin/login")
      }
    } catch (error) {
      router.push("/admin/login")
    }
  }

  const fetchStateScores = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/analysis/state-scores")

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || "Failed to fetch state scores")
      }

      const data = await response.json()
      setStateScores(data)
    } catch (error: any) {
      console.error("Error fetching state scores:", error)
      setError(error.message || "Failed to fetch state scores. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for LSAr chart
  const lsarChartData = stateScores.map((item) => ({
    state: item.state,
    lsarScore: item.lsarScore,
    color: item.colorCoding.color,
    label: item.colorCoding.label,
    count: item.count,
  }))

  // Prepare data for section chart
  const sectionChartData = stateScores.map((item) => ({
    state: item.state,
    score: item.averageScores[selectedSection] || 0,
    count: item.count,
  }))

  // Get section display name
  const getSectionDisplayName = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    return section ? section.title : sectionId
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 text-center">Local Security Architecture Analysis</h1>
            <p className="text-slate-600 dark:text-slate-300 text-center text-lg">
              Comprehensive analysis of security preparedness across Nigerian states
            </p>

            {/* Summary Cards */}
            {!loading && !error && stateScores.length > 0 && (
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
                        <p className="text-sm text-muted-foreground">States Analyzed</p>
                        <p className="text-2xl font-bold">{stateScores.length}</p>
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
                        <p className="text-2xl font-bold">{stateScores.reduce((sum, state) => sum + state.count, 0)}</p>
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
                          {(stateScores.reduce((sum, state) => sum + state.lsarScore, 0) / stateScores.length).toFixed(
                            1,
                          )}
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
              <TabsTrigger value="comparison">State Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="lsar">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Local Security Architecture Rating (LSAr)
                    <Badge variant="outline">Weighted Score</Badge>
                  </CardTitle>
                  <CardDescription>
                    Overall security preparedness rating using weighted calculation: LSAr = ∑(2X₁, X₂, 2X₃, 2X₄, 2X₅,
                    X₆)/10
                  </CardDescription>

                  {/* Color Legend */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {colorCoding.map((coding) => (
                      <Badge
                        key={coding.code}
                        variant="outline"
                        className="border-2"
                        style={{ borderColor: coding.color, color: coding.color }}
                      >
                        {coding.label} ({coding.min}-{coding.max}%)
                      </Badge>
                    ))}
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
                  ) : stateScores.length === 0 ? (
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
                        <BarChart data={lsarChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" angle={-45} textAnchor="end" height={70} />
                          <YAxis
                            domain={[0, 100]}
                            label={{ value: "LSAr Score (%)", angle: -90, position: "insideLeft" }}
                          />
                          <ChartTooltip
                            content={(
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
                            )}
                          />
                          <Bar dataKey="lsarScore" name="LSAr Score" radius={[4, 4, 0, 0]}>
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
                  <CardDescription>Average scores by state for selected security dimension</CardDescription>
                  <div className="mt-4 w-full max-w-md">
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
                  ) : stateScores.length === 0 ? (
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
                      className="h-[500px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" angle={-45} textAnchor="end" height={70} />
                          <YAxis domain={[0, 100]} label={{ value: "Score (%)", angle: -90, position: "insideLeft" }} />
                          <ChartTooltip
                            content={(
                              <ChartTooltipContent
                                formatter={(value, name, props) => {
                                  if (name === "score")
                                    return [`${value.toFixed(1)}%`, getSectionDisplayName(selectedSection)]
                                  return [value, name]
                                }}
                              />
                            )}
                          />
                          <Bar dataKey="score" name="Section Score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
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
                  <CardDescription>Compare all security dimensions across states</CardDescription>
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
                  ) : stateScores.length === 0 ? (
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
                          data={stateScores.map((item) => ({
                            state: item.state,
                            "decision-making": item.averageScores["decision-making"] || 0,
                            instruments: item.averageScores["instruments"] || 0,
                            intelligence: item.averageScores["intelligence"] || 0,
                            resources: item.averageScores["resources"] || 0,
                            institutions: item.averageScores["institutions"] || 0,
                            evaluation: item.averageScores["evaluation"] || 0,
                          }))}

                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" angle={-45} textAnchor="end" height={70} />
                          <YAxis domain={[0, 100]} label={{ value: "Score (%)", angle: -90, position: "insideLeft" }} />
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
