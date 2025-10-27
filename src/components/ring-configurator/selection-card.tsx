"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface SelectionCardProps {
  label: string
  image?: string
  isSelected: boolean
  onClick: () => void
  className?: string
  children?: React.ReactNode
}

export function SelectionCard({ label, image, isSelected, onClick, className, children }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
        className,
      )}
    >
      {image && <img src={image || "/placeholder.svg"} alt={label} className="h-16 w-16 object-contain" />}
      {children}
      <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>{label}</span>
    </button>
  )
}
