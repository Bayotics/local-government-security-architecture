import type React from "react"
import { Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { Analytics } from '@vercel/analytics/next'

const raleway = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
  weight: ["100", "200","300", "400","500", "600", "700", "800", "900"],
})
export const metadata = {
  title: "Nigeria Security Awareness Survey",
  description: "Survey application for security awareness in Nigerian local governments",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={raleway.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
         <Analytics />
      </body>
    </html>
  )
}
