"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, UserCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function Header() {
  const router = useRouter()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 2.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Navigation buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#64FFDA]/30 transition-all"
          >
            <Home className="h-4 w-4 text-[#64FFDA]" />
          </Link>

          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#64FFDA]/30 transition-all text-sm font-light flex items-center gap-2"
          >
            <UserCircle className="h-4 w-4" />
            Admin Signin
          </Link>

          <Link
            href="#features"
            className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#64FFDA]/30 transition-all text-sm font-light"
          >
            How it Works
          </Link>
        </div>

        {/* Right side - CTA button */}
        <button
          onClick={() => router.push("/survey-access")}
          className="px-6 py-2 rounded-lg bg-[#64FFDA]/10 backdrop-blur-md border border-[#64FFDA]/30 hover:bg-[#64FFDA]/20 hover:border-[#64FFDA]/50 transition-all text-sm font-medium text-[#64FFDA]"
        >
          Take Survey Now
        </button>
      </nav>
    </motion.header>
  )
}
