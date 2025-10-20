"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useConfigStore } from "@/store/configurator"
import Image from "next/image"

const METALS = [
  { key: "white",    label: "White Gold",  src: "/metal/white.png" },
  { key: "yellow",   label: "Yellow Gold", src: "/metal/yellow.png" },
  { key: "rose",     label: "Rose Gold",   src: "/metal/rose.png" },
  { key: "platinum", label: "Platinum",    src: "/metal/platinum.png" },
] as const

const PURITIES = [
  { key: "9k",  label: "9K" },
  { key: "14k", label: "14K" },
  { key: "18k", label: "18K" },
] as const

export default function MetalCard() {
  const metal       = useConfigStore(s => s.metal)
  const purity      = useConfigStore(s => s.purity)
  const setMetal    = useConfigStore(s => s.setMetal)
  const setPurity   = useConfigStore(s => s.setPurity)

  const activeLabel = METALS.find(m => m.key === metal)?.label ?? ""

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-[15px] tracking-wide">METAL</CardTitle>
            <span className="text-sm text-muted-foreground">{activeLabel}</span>
          </div>
          
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-3 flex gap-3">
          {METALS.map(m => {
            const selected = metal === m.key
            return (
              <button
                key={m.key}
                onClick={() => setMetal(m.key as typeof metal)}  // store will clear purity if platinum
                title={m.label}
                className={[
                  "relative w-14 h-14 rounded-full border-2 overflow-hidden bg-white",
                  selected ? "border-black" : "border-gray-300",
                  "focus:outline-none focus:ring-2 focus:ring-black/40"
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

        {/* purity pills (hidden for platinum) */}
        {metal !== "platinum" && (
          <>
            <div className="text-sm font-semibold mb-2">Purity</div>
            <div className="flex flex-wrap gap-2">
              {PURITIES.map(p => (
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
