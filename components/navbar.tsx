"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Map, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
  }, [])

  // Only show navbar if user is authenticated
  if (!isAuthenticated) return null

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center font-bold text-xl mr-4">
          <Shield className="h-6 w-6 mr-2 text-primary" />
          <span>Nigeria Security Survey</span>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <Link
            href="/select-location"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              pathname === "/select-location" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Map className="h-4 w-4 mr-1" />
            Survey
          </Link>
          <Link
            href="/analysis"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              pathname === "/analysis" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            State Analysis
          </Link>
          <Link
            href="/local-analysis"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              pathname === "/local-analysis" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            LGA Analysis
          </Link>
        </nav>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("isAuthenticated")
              localStorage.removeItem("selectedState")
              localStorage.removeItem("selectedLga")
              localStorage.removeItem("surveyAnswers")
              localStorage.removeItem("currentSectionIndex")
              window.location.href = "/"
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
