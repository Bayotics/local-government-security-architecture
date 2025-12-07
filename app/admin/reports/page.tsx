"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminReports() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Survey Reports</h1>
          <p className="text-muted-foreground">View and manage all submitted survey responses</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Reports</CardTitle>
          <CardDescription>Access detailed survey submissions from all LGAs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Survey reports functionality will be available here.</p>
            <p className="text-sm mt-2">
              This section will display all submitted surveys with filtering and export options.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
