"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const STYLE_OPTIONS = [
  { key: "plain",      label: "Plain",       src: "/rings/plain.png" },
  { key: "cathedral",  label: "Cathedral",   src: "/rings/cathedral.png" },
  { key: "knife",      label: "Knife Edge",  src: "/rings/knife-edge.png" },
  { key: "split",      label: "Split",       src: "/rings/split.png" },
  { key: "twisted",    label: "Twisted",     src: "/rings/twisted.png" },
  { key: "wide_plain", label: "Wide Plain",  src: "/rings/wide-plain.png" },
]

export default function StyleCard() {
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
          
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STYLE_OPTIONS.map((opt) => {
            const selected = active === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => setActive(opt.key)}
                title={opt.label}
                className={[
                  "relative flex-shrink-0 w-14 h-14 rounded-full border-2 overflow-hidden",
                  selected ? "border-black" : "border-gray-300",
                  "focus:outline-none focus:ring-0 focus:ring-black/40"
                ].join(" ")}
              >
                {/* rings image */}
                
                  <Image
                    src={opt.src}
                    alt={opt.label}
                    fill
                    sizes="56px"
                    className="object-cover object-center scale-90"
                    priority
                  />
                
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
