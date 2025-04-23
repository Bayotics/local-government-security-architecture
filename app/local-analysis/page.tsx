"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/newChart"
import { sections } from "@/lib/survey-data"
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
  const [selectedSection, setSelectedSection] = useState<string>("Authority & Governance")
  const [activeTab, setActiveTab] = useState("lga")
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

  // Prepare data for the chart
  const chartData = filteredLGAs.map((item) => ({
    lga: `${item.lga} (${item.state})`,
    score: item.averageScores[selectedSection] || 0,
    count: item.count,
  }))

  // Get all section names
  const sectionNames = sections.map((section) => section.title)

  // Get all state names plus "All States" option
  const stateNames = ["All States", ...nigerianStates.map((state) => state.name)]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Local Government Analysis</h1>
            <p className="text-slate-500 dark:text-slate-400">
              View security scores across local government areas based on survey data
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="lga">LGA Comparison</TabsTrigger>
              <TabsTrigger value="section">Section Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="lga">
              <Card>
                <CardHeader>
                  <CardTitle>Local Government Security Scores</CardTitle>
                  <CardDescription>Compare security scores across local governments</CardDescription>
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
                          {sectionNames.map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
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
                          label: "Security Score",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[600px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={[0, 10]}
                            label={{ value: "Score (0-10)", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis type="category" dataKey="lga" width={150} tick={{ fontSize: 12 }} />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name, props) => {
                                  if (name === "score") return [`${value.toFixed(1)}/10`, "Score"]
                                  return [value, name]
                                }}
                              />
                            }
                          />
                          <Legend />
                          <Bar dataKey="score" name="Security Score" fill="var(--color-score)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="section">
              <Card>
                <CardHeader>
                  <CardTitle>LGA Section Comparison</CardTitle>
                  <CardDescription>Compare section scores for selected local governments</CardDescription>
                  <div className="mt-4">
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
                        authority: {
                          label: "Authority & Governance",
                          color: "hsl(var(--chart-1))",
                        },
                        resources: {
                          label: "Resources & Personnel",
                          color: "hsl(var(--chart-2))",
                        },
                        funding: {
                          label: "Funding & Budget",
                          color: "hsl(var(--chart-3))",
                        },
                        infrastructure: {
                          label: "Infrastructure",
                          color: "hsl(var(--chart-4))",
                        },
                        community: {
                          label: "Community",
                          color: "hsl(var(--chart-5))",
                        },
                        technology: {
                          label: "Technology",
                          color: "hsl(var(--chart-6))",
                        },
                      }}
                      className="h-[600px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredLGAs.map((item) => ({
                            lga: `${item.lga} (${item.state})`,
                            authority: item.averageScores["Authority & Governance"] || 0,
                            resources: item.averageScores["Resources & Personnel"] || 0,
                            funding: item.averageScores["Funding & Budget Allocation"] || 0,
                            infrastructure: item.averageScores["Infrastructure & Facilities"] || 0,
                            community: item.averageScores["Community Engagement"] || 0,
                            technology: item.averageScores["Technology & Intelligence"] || 0,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            domain={[0, 10]}
                            label={{ value: "Score (0-10)", position: "insideBottom", offset: -5 }}
                          />
                          <YAxis type="category" dataKey="lga" width={150} tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="authority"
                            name="Authority & Governance"
                            fill="var(--color-authority)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="resources"
                            name="Resources & Personnel"
                            fill="var(--color-resources)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="funding"
                            name="Funding & Budget"
                            fill="var(--color-funding)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="infrastructure"
                            name="Infrastructure"
                            fill="var(--color-infrastructure)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="community"
                            name="Community"
                            fill="var(--color-community)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar
                            dataKey="technology"
                            name="Technology"
                            fill="var(--color-technology)"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>Data is aggregated from all completed surveys. Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </>
  )
}
