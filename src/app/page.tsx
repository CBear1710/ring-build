import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StyleCard from "@/components/style-card"
import MetalCard from "@/components/metal"   
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 grid gap-7 grid-cols-[360px_1fr_360px] max-[1199px]:grid-cols-[340px_1fr] max-[767px]:grid-cols-1">
      {/* LEFT PANEL */}
      <aside className="flex flex-col gap-4 sticky top-6 self-start">
        <Tabs defaultValue="setting" className="w-full">
          <TabsList className="grid grid-cols-3 rounded-full bg-zinc-200/60 p-1">
            <TabsTrigger value="setting" className="rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
              SETTING
            </TabsTrigger>
            <TabsTrigger value="stone" className="rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
              STONE
            </TabsTrigger>
            <TabsTrigger value="shank" className="rounded-full data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
              SHANK
            </TabsTrigger>
          </TabsList>

          {/* SETTING TAB */}
          <TabsContent value="setting" className="mt-4 space-y-4">
            <StyleCard price={1000} />
            <MetalCard price={500} />
            <Button className="w-full justify-start gap-3 rounded-full border border-gray-300 bg-zinc-800 text-white hover:bg-zinc-700">
              <span className="inline-block w-5 h-5 rounded-full bg-zinc-600" />
              SELECT STONE
              <span className="ml-auto">›</span>
            </Button>
          </TabsContent>

          {/* STONE TAB */}
          <TabsContent value="stone" className="mt-4">
            <div className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">
              
            </div>
          </TabsContent>

          {/* SHANK TAB */}
          <TabsContent value="shank" className="mt-4">
            <div className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">
              
            </div>
          </TabsContent>
        </Tabs>
      </aside>

      {/* CENTER VIEWER */}
      <section className="bg-white border rounded-xl min-h-[80vh] flex items-center justify-center">
        <div className="text-gray-400">Viewer area</div>
      </section>

      {/* RIGHT SUMMARY placeholder */}
      <aside className="rounded-xl" />
    </main>
  )
}
