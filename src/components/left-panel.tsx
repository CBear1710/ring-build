"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StyleCard from "@/components/style-card"
import MetalCard from "@/components/metal"
import { Button } from "@/components/ui/button"
import { Settings2, Gem, Circle } from "lucide-react"

export default function LeftPanel() {
  // local UI state controlling which tab is active
  const [tab, setTab] = useState<"setting" | "stone" | "shank">("setting")

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
      <TabsList className="grid grid-cols-3 rounded-full bg-zinc-200/60 p-1">
        <TabsTrigger
          value="setting"
          className="flex items-center gap-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
        >
          <Settings2 className="h-4 w-4" />
          SETTING
        </TabsTrigger>
        <TabsTrigger
          value="stone"
          className="flex items-center gap-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
        >
          <Gem className="h-4 w-4" />
          STONE
        </TabsTrigger>
        <TabsTrigger
          value="shank"
          className="flex items-center gap-2 rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
        >
          <Circle className="h-4 w-4" />
          SHANK
        </TabsTrigger>
      </TabsList>

      {/* SETTING TAB */}
      <TabsContent value="setting" className="mt-4 space-y-4">
        <StyleCard price={1000} />
        <MetalCard price={500} />
        <Button
          onClick={() => setTab("stone")}                     
          className="w-full justify-start gap-3 rounded-full border border-gray-300 bg-zinc-800 text-white hover:bg-zinc-700"
        >
          <Gem className="h-5 w-5" />
          SELECT STONE
          <span className="ml-auto">›</span>
        </Button>
      </TabsContent>

      {/* STONE TAB */}
      <TabsContent value="stone" className="mt-4">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">
          Stone configurator coming soon.
        </div>
      </TabsContent>

      {/* SHANK TAB */}
      <TabsContent value="shank" className="mt-4">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">
          Shank options will be added here.
        </div>
      </TabsContent>
    </Tabs>
  )
}
