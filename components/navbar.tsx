"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Map, Shield } from "lucide-react"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
  }, [])

  if (!isAuthenticated) return null

  return (
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center font-bold text-xl mr-4">
          <Shield className="h-6 w-6 mr-2 text-primary animate-pulse" />
          <span className="gradient-text">Nigeria Security Survey</span>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-all hover:text-primary flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10",
              pathname === "/" ? "text-primary bg-primary/10" : "text-muted-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/select-location"
            className={cn(
              "text-sm font-medium transition-all hover:text-primary flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10",
              pathname === "/select-location" ? "text-primary bg-primary/10" : "text-muted-foreground",
            )}
          >
            <Map className="h-4 w-4" />
            Survey
          </Link>
          <Link
            href="/analysis"
            className={cn(
              "text-sm font-medium transition-all hover:text-primary flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10",
              pathname === "/analysis" ? "text-primary bg-primary/10" : "text-muted-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            State Analysis
          </Link>
          <Link
            href="/local-analysis"
            className={cn(
              "text-sm font-medium transition-all hover:text-primary flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10",
              pathname === "/local-analysis" ? "text-primary bg-primary/10" : "text-muted-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            LGA Analysis
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
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
            className="hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
