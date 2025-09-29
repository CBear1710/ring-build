"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StyleCard from "@/components/style-card"
import MetalCard from "@/components/metal"
import { Button } from "@/components/ui/button"
import { Settings2, Gem, Circle, RotateCcw, ChevronRight } from "lucide-react"
import { useConfigStore } from "@/store/configurator"  
import StoneCard from "@/components/stone-card";
import EngravingCard from "@/components/engraving-card";
import RingSizeCard from "@/components/ring-size-card";

export default function LeftPanel() {
  const tab    = useConfigStore((s) => s.tab)
  const setTab = useConfigStore((s) => s.setTab)
  const reset  = useConfigStore((s) => s.reset)
  const resetKeepTab = useConfigStore((s) => s.resetKeepTab);  

  const selectionKey = useConfigStore(
    (s) => `${s.style}|${s.metal}|${s.purity ?? "null"}`
  )


  const [resetCount, setResetCount] = useState(0)

  const onReset = () => {
    reset()                
    setTab("setting")    
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
          onClick={resetKeepTab}
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 shrink-0 bg-white shadow-sm"
          title="Reset to defaults"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      <TabsContent value="setting" className="mt-4 space-y-4">
        
        <StyleCard key={`style-${selectionKey}-${resetCount}`} />
        <MetalCard  key={`metal-${selectionKey}-${resetCount}`} />

        <Button
          onClick={()=>setTab("stone")}
          className=" w-1/2 h-11 rounded-full px-4 justify-start gap-2 bg-[#3A3A3C] text-white hover:bg-[#2F2F31] shadow-sm"
        >
          <Gem className="h-4 w-4" />
          SELECT STONE
          <ChevronRight className="ml-auto h-5 w-5" />
        </Button>
      </TabsContent>

      <TabsContent value="stone" className="mt-4 space-y-4">
        <StoneCard />
        <Button
          onClick={()=>setTab("shank")}
          className=" w-1/2 h-11 rounded-full px-4 justify-start gap-2 bg-[#3A3A3C] text-white hover:bg-[#2F2F31] shadow-sm"
           
        >
          <Circle className ="h-4 w-4" />
          COMPLETE RING
          <ChevronRight className="ml-auto h-5 w-5" />
        </Button>
      </TabsContent>


      <TabsContent value="shank" className="mt-4">
        <EngravingCard />
        <RingSizeCard />
      </TabsContent>
    </Tabs>
  )
}
