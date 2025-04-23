"use client"

import type * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ config, children, className }: ChartContainerProps) {
  return (
    <div
      className={className}
      style={Object.entries(config).reduce(
        (acc, [key, value]) => {
          acc[`--color-${key}`] = value.color
          return acc
        },
        {
          "--chart-1": "221.2 83.2% 53.3%",
          "--chart-2": "355.6 100% 61.8%",
          "--chart-3": "25.6 100% 61.8%",
          "--chart-4": "48.6 100% 61.8%",
          "--chart-5": "167.6 100% 61.8%",
          "--chart-6": "262.1 100% 61.8%",
        } as React.CSSProperties,
      )}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps {
  className?: string
  children?: React.ReactNode
  content?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChartTooltip({ className, children, content, open, defaultOpen, onOpenChange }: ChartTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={className}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
  className?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={`rounded-lg border bg-background p-2 shadow-md ${className}`}>
      <div className="grid gap-2">
        {label && <div className="font-medium">{labelFormatter ? labelFormatter(label) : label}</div>}
        <div className="grid gap-1">
          {payload.map((item: any, index: number) => {
            const formattedValue = formatter ? formatter(item.value, item.name, item) : [item.value, item.name]

            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-muted-foreground">{formattedValue[1]}:</span>
                <span>{formattedValue[0]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
