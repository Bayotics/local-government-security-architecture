"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, UserCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import Logo from "./logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isHomepage = pathname === "/"
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isLightMode = mounted && theme === "light"

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isHomepage
          ? "bg-black backdrop-blur-md "
          : isScrolled
            ? isLightMode
              ? "bg-white/95 backdrop-blur-md "
              : "bg-black backdrop-blur-md"
            : isLightMode
              ? "bg-white/80 backdrop-blur-md"
              : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="h-8 w-auto transition-transform group-hover:scale-105" />
              <span
                className={cn(
                  "text-xl font-normal tracking-tight transition-colors",
                  isHomepage || !isLightMode ? "text-white" : "text-primary",
                )}
              >
                LSAT
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/admin/login" className="ml-10">
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg backdrop-blur-md border transition-all text-sm font-light flex items-center gap-2",
                    isHomepage
                      ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white"
                      : isLightMode
                        ? "bg-muted/50 border-border hover:bg-muted hover:border-primary/40 text-foreground"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white/90",
                  )}
                >
                  <UserCircle className="h-4 w-4" />
                  Admin Signin
                </button>
              </Link>

              <Link href="/how-it-works">
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg backdrop-blur-md border transition-all text-sm font-light",
                    isHomepage
                      ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white"
                      : isLightMode
                        ? "bg-muted/50 border-border hover:bg-muted hover:border-primary/40 text-foreground font-medium"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white/90",
                  )}
                >
                  How it Works
                </button>
              </Link>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link href="/lga-login">
              <button
                className={cn(
                  "px-6 py-2 rounded-lg backdrop-blur-md border transition-all text-sm font-medium",
                  isHomepage || !isLightMode
                    ? "bg-[#34D399]/10 border-[#34D399]/30 hover:bg-[#34D399]/20 hover:border-[#34D399]/50 text-[#34D399]"
                    : "bg-primary/20 border-primary/40 hover:bg-primary/30 hover:border-primary/60 text-primary",
                )}
              >
                Take Survey Now
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isHomepage || !isLightMode ? "text-white" : "text-foreground")}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className={cn("w-80", isHomepage || !isLightMode ? "bg-black" : "bg-background")}>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      className={cn(
                        "w-full px-4 py-3 rounded-lg backdrop-blur-md border transition-all text-sm font-medium",
                        isHomepage || !isLightMode
                          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white"
                          : "bg-muted/50 border-border hover:bg-muted hover:border-primary/40 text-foreground",
                      )}
                    >
                      How it Works
                    </button>
                  </Link>

                  <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      className={cn(
                        "w-full px-4 py-3 rounded-lg backdrop-blur-md border transition-all text-sm font-medium flex items-center justify-center gap-2",
                        isHomepage || !isLightMode
                          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 text-white"
                          : "bg-muted/50 border-border hover:bg-muted hover:border-primary/40 text-foreground",
                      )}
                    >
                      <UserCircle className="h-4 w-4" />
                      Admin Signin
                    </button>
                  </Link>

                  <Link href="/lga-login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      className={cn(
                        "w-full px-4 py-3 rounded-lg backdrop-blur-md border transition-all text-sm font-semibold",
                        isHomepage || !isLightMode
                          ? "bg-[#34D399]/10 border-[#34D399]/30 hover:bg-[#34D399]/20 hover:border-[#34D399]/50 text-[#34D399]"
                          : "bg-primary/20 border-primary/40 hover:bg-primary/30 hover:border-primary/60 text-primary",
                      )}
                    >
                      Take Survey Now
                    </button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
