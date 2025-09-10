"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState,useEffect,useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StyleCard from "@/components/style-card"
import MetalCard from "@/components/metal"
import { Button } from "@/components/ui/button"
import { Settings2, Gem, Circle, RotateCcw } from "lucide-react"

const STYLE_OPTIONS = [
  { key: "plain", label: "Plain" },
  { key: "cathedral", label: "Cathedral" },
  { key: "knife", label: "Knife Edge" },
  { key: "split", label: "Split" },
  { key: "twisted", label: "Twisted" },
  { key: "wide_plain", label: "Wide Plain" },
]

const METAL_OPTIONS = [
  { key: "white", label: "White Gold" },
  { key: "yellow", label: "Yellow Gold" },
  { key: "rose", label: "Rose Gold" },
  { key: "platinum", label: "Platinum" },
]

const PURITY_OPTIONS = [
  { key: "9k", label: "9K" },
  { key: "14k", label: "14K (+$800)" },
  { key: "18k", label: "18K (+$1000)" },
]

export default function LeftPanel() {
  const [tab, setTab] = useState<"setting"|"stone"|"shank">("setting")

  // (kept for future use) 
  const defaultStyle = useMemo(() => STYLE_OPTIONS[0].key, [])
  const defaultMetal = useMemo(() => METAL_OPTIONS[0].key, [])
  const defaultPurity = useMemo(() => PURITY_OPTIONS[0].key, [])

  // (kept for future use) parent-held selection state
  const [style, setStyle] = useState<string>(defaultStyle)
  const [metal, setMetal] = useState<string>(defaultMetal)
  const [purity, setPurity] = useState<string | null>(defaultPurity)

  // counter  force-remount child cards on reset
  const [resetCount, setResetCount] = useState(0)

  const onReset = () => {
    setTab("setting")
    setStyle(defaultStyle)
    setMetal(defaultMetal)
    setPurity(defaultPurity)
    setResetCount((c) => c + 1)          
  }

  return (
    <Tabs value={tab} onValueChange={(v)=>setTab(v as any)} className="w-full">
      
      <div className="flex items-center gap-2">
        <TabsList className="grid grid-cols-3 rounded-full bg-secondary p-1 h-10">
          <TabsTrigger
            value="setting"
            className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Settings2 className="h-4 w-4" /> SETTING
          </TabsTrigger>
          <TabsTrigger
            value="stone"
            className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Gem className="h-4 w-4" /> STONE
          </TabsTrigger>
          <TabsTrigger
            value="shank"
            className="rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Circle className="h-4 w-4" /> SHANK
          </TabsTrigger>
        </TabsList>

        
        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 shrink-0 bg-white shadow-sm"
          title="Reset to defaults"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      <TabsContent value="setting" className="mt-4 space-y-4">
        
        <StyleCard key={`style-${resetCount}`} />
        <MetalCard  key={`metal-${resetCount}`} />

        <Button
          onClick={()=>setTab("stone")}
          className=" w-1/2 h-11 rounded-full px-4 justify-start gap-2 bg-[#3A3A3C] text-white hover:bg-[#2F2F31] shadow-sm"
        >
          <Gem className="h-4 w-4" />
          SELECT STONE
          <span className="text-[13px] font-semibold tracking-wide">›</span>
        </Button>
      </TabsContent>

      <TabsContent value="stone" className="mt-4">
        <div className="bg-card border rounded-2xl shadow-sm p-6 text-sm text-muted-foreground">
          Stone configurator coming soon.
        </div>
      </TabsContent>

      <TabsContent value="shank" className="mt-4">
        <div className="bg-card border rounded-2xl shadow-sm p-6 text-sm text-muted-foreground">
          Shank options will be added here.
        </div>
      </TabsContent>
    </Tabs>
  )
}
