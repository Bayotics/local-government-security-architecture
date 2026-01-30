"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAudio } from "@/context/audio-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Map, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const pathname = usePathname()
  const { stopAudio } = useAudio()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(authStatus)
  }, [])

  if (!isAuthenticated) return null

  const navigationLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/select-location", label: "Survey", icon: Map },
  ]

  const NavLinks = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <>
      {navigationLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => {
            // Stop audio when navigating to home
            if (href === "/") {
              stopAudio()
            }
            onClick?.()
          }}
          className={cn(
            "text-sm font-medium transition-all hover:text-primary flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10",
            pathname === href ? "text-primary bg-primary/10" : "text-muted-foreground",
            className
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </>
  )

  const handleLogout = () => {
    stopAudio() // Stop audio when logging out
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("selectedState")
    localStorage.removeItem("selectedLga")
    localStorage.removeItem("surveyAnswers")
    localStorage.removeItem("currentSectionIndex")
    localStorage.removeItem("audioState")
    globalThis.location.href = "/"
  }

  return (
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <NavLinks />
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="flex flex-col gap-4 mt-6">
              <NavLinks onClick={() => setIsOpen(false)} className="w-full" />
            </nav>

            <div className="mt-8 flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="hover:bg-destructive hover:text-destructive-foreground transition-all"
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Actions */}
        <div className="hidden md:flex ml-auto items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}