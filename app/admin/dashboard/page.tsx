"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, BarChart3, Users, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import type { LGAWhitelist } from "@/lib/models"

export default function AdminDashboard() {
  const router = useRouter()
  const [lgas, setLgas] = useState<LGAWhitelist[]>([])
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const menuItems = [
    {
      title: "Manage Users and Access",
      description: "Manage LGA whitelist, device bindings, and access control",
      icon: Users,
      href: "/admin/whitelist",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Analysis Dashboard",
      description: "View comprehensive security analysis and reports",
      icon: BarChart3,
      href: "/analysis",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Survey Reports",
      description: "View and manage all submitted survey responses",
      icon: FileText,
      href: "/admin/reports",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "System Settings",
      description: "Configure system settings and preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "from-orange-500 to-orange-600",
    },
  ]

  useEffect(() => {
    // Check admin auth
    checkAuth()
    fetchLGAs()
  }, [search, stateFilter, statusFilter])

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

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const fetchLGAs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (stateFilter && stateFilter !== "all") params.append("state", stateFilter)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/lga-whitelist?${params}`)
      const data = await response.json()
      setLgas(data.lgas)
    } catch (error) {
      console.error("[v0] Fetch LGAs error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetDevice = async (lgaId: string) => {
    if (!confirm("Are you sure you want to reset the bound device for this LGA?")) {
      return
    }

    try {
      await fetch("/api/admin/reset-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lgaId }),
      })
      fetchLGAs()
    } catch (error) {
      console.error("[v0] Reset device error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Nigeria Security Architecture Survey</p>
              </div>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} w-fit`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-foreground group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-base">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                      Access
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">Total LGAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">774</div>
              <p className="text-muted-foreground text-sm mt-2">Across Nigeria</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">Active Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">Active</div>
              <p className="text-muted-foreground text-sm mt-2">System operational</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">Full</div>
              <p className="text-muted-foreground text-sm mt-2">All permissions granted</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
