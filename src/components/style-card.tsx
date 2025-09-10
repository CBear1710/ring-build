"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const STYLE_OPTIONS = [
  { key: "plain", label: "Plain" },
  { key: "cathedral", label: "Cathedral" },
  { key: "knife", label: "Knife Edge" },
  { key: "split", label: "Split" },
  { key: "twisted", label: "Twisted" },
  { key: "wide_plain", label: "Wide Plain" },
]

export default function StyleCard({ price = 1000 }: { price?: number }) {
  const [active, setActive] = useState("plain")

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-base tracking-wide">STYLE</CardTitle>
            <span className="text-sm text-muted-foreground">
              {STYLE_OPTIONS.find(o => o.key === active)?.label}
            </span>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">${price}</div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STYLE_OPTIONS.map((opt, i) => (
            <button
              key={opt.key}
              onClick={() => setActive(opt.key)}
              title={opt.label}
              className={[
                "flex-shrink-0 w-14 h-14 rounded-full border-2 grid place-items-center transition",
                active === opt.key ? "border-black" : "border-gray-300"
              ].join(" ")}
            >
              {/* placeholder (swap with <img /> later) */}
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm">
                {i + 1}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
