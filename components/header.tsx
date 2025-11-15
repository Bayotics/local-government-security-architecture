"use client"

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Home, UserCircle } from 'lucide-react'
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-[#0A192F]/95 backdrop-blur-md border-b border-primary/10" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 transition-all">
                <Home className="h-4 w-4 text-[#34D399]" />
              </button>
            </Link>

            <Link href="/admin/login">
              <button className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 transition-all text-sm font-light flex items-center gap-2 text-white/90">
                <UserCircle className="h-4 w-4" />
                Admin Signin
              </button>
            </Link>

            <Link href="#features">
              <button className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#34D399]/30 transition-all text-sm font-light text-white/90">
                How it Works
              </button>
            </Link>
          </div>

          <Link href="/lga-login">
            <button className="px-6 py-2 rounded-lg bg-[#34D399]/10 backdrop-blur-md border border-[#34D399]/30 hover:bg-[#34D399]/20 hover:border-[#34D399]/50 transition-all text-sm font-medium text-[#34D399]">
              Take Survey Now
            </button>
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
