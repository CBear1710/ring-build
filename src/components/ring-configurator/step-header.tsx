"use client"

import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepHeaderProps {
  title: string
  subtitle?: string
  onReset: () => void
}

export function StepHeader({ title, subtitle, onReset }: StepHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-lg font-medium text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}
