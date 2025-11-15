"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, Edit, RotateCcw } from 'lucide-react'
import Link from "next/link"
import type { LGAWhitelist } from "@/lib/models"

export default function AdminDashboard() {
  const router = useRouter()
  const [lgas, setLgas] = useState<LGAWhitelist[]>([])
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
      console.error("[v0] Logout error:", error)
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage LGA whitelist and access</p>
        </div>
        <div className="flex gap-2">
          <Link href="/analysis">
            <Button variant="outline">View Analysis</Button>
          </Link>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search LGA or Chairman..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                  {/* Add more states */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="replaced">Replaced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LGA Whitelist ({lgas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : lgas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No LGAs found</div>
            ) : (
              lgas.map((lga) => (
                <div
                  key={lga._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{lga.lgaName}</h3>
                      <Badge variant={lga.status === "active" ? "default" : "secondary"}>
                        {lga.status}
                      </Badge>
                      {lga.boundDeviceId && (
                        <Badge variant="outline">Device Bound</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{lga.stateName}</p>
                    <p className="text-sm">{lga.chairmanName}</p>
                    <p className="text-sm text-muted-foreground">{lga.officialPhone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {lga.boundDeviceId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetDevice(lga.lgaId)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
