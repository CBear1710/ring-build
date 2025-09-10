"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const METALS = [
  { key: "white",    label: "White Gold",  src: "/metal/white.png" },
  { key: "yellow",   label: "Yellow Gold", src: "/metal/yellow.png" },
  { key: "rose",     label: "Rose Gold",   src: "/metal/rose.png" },
  { key: "platinum", label: "Platinum",    src: "/metal/platinum.png" },
]

const PURITIES = [
  { key: "9k",  label: "9K" },
  { key: "14k", label: "14K" },
  { key: "18k", label: "18K" },
]

export default function MetalCard() {
  const [metal, setMetal] = useState("white")
  const [purity, setPurity] = useState("9k")

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-[15px] tracking-wide">METAL</CardTitle>
            <span className="text-sm text-muted-foreground">
              {METALS.find((m) => m.key === metal)?.label}
            </span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Swatches */}
        <div className="mb-3 flex gap-3">
          {METALS.map((m) => {
            const selected = metal === m.key
            return (
              <button
                key={m.key}
                onClick={() => setMetal(m.key)}
                title={m.label}
                className={[
                  "relative w-14 h-14 rounded-full border-2 overflow-hidden bg-white",
                  selected ? "border-primary" : "border-border",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                ].join(" ")}
              >
                <Image
                  src={m.src}
                  alt={m.label}
                  fill
                  sizes="56px"
                  className="object-cover object-center"
                  priority
                />
              </button>
            )
          })}
        </div>

        
        {metal !== "platinum" && (
          <>
            <div className="text-sm font-semibold mb-2">Purity</div>
            <div className="flex flex-wrap gap-2">
              {PURITIES.map((p) => (
                <Button
                  key={p.key}
                  onClick={() => setPurity(p.key)}
                  variant={purity === p.key ? "default" : "outline"}
                  className="rounded-full px-4 h-9"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
