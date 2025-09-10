"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const METALS = [
  { key: "white",    label: "White Gold",  ring: "bg-gray-200" },
  { key: "yellow",   label: "Yellow Gold", ring: "bg-yellow-300" },
  { key: "rose",     label: "Rose Gold",   ring: "bg-rose-300" },
  { key: "platinum", label: "Platinum",    ring: "bg-gray-100" },
]

const PURITIES = [
  { key: "9k",  label: "9K" },
  { key: "14k", label: "14K (+$800)" },
  { key: "18k", label: "18K (+$1000)" },
]

export default function MetalCard({ price = 500 }: { price?: number }) {
  const [metal, setMetal] = useState("white")
  const [purity, setPurity] = useState("9k")

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-base tracking-wide">METAL</CardTitle>
            <span className="text-sm text-muted-foreground">
              {METALS.find(m => m.key === metal)?.label}
            </span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">${price}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* swatches */}
        <div className="mb-3 flex gap-3">
          {METALS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetal(m.key)}
              title={m.label}
              className={[
                "w-14 h-14 rounded-full border-2 bg-white grid place-items-center transition",
                metal === m.key ? "border-black" : "border-gray-300"
              ].join(" ")}
            >
              <span className={`w-11 h-11 rounded-full border ${m.ring}`} />
            </button>
          ))}
        </div>

        {/* purity pills */}
        <div className="text-sm font-semibold mb-2">Purity</div>
        <div className="flex flex-wrap gap-2">
          {PURITIES.map(p => (
            <Button
              key={p.key}
              onClick={() => setPurity(p.key)}
              variant={purity === p.key ? "default" : "outline"}
              className="rounded-full px-4"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
