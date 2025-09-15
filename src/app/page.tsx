import LeftPanel from "@/components/left-panel"
import UrlSync from "@/components/url-sync";

export const dynamic = "force-dynamic"
export default function Page() {
  return (
    <main className="
      min-h-screen bg-background
      px-6 py-6
      grid gap-7
      grid-cols-[360px_1fr_360px]
      max-[1199px]:grid-cols-[340px_1fr]
      max-[767px]:grid-cols-1
    ">
      <UrlSync />

      {/* LEFT */}
      <aside className="sticky top-6 self-start flex flex-col gap-4">
        <LeftPanel />
      </aside>

      {/* CENTER viewer placeholder */}
      <section className="bg-card border rounded-2xl min-h-[78vh] flex items-center justify-center">
        <div className="text-muted-foreground">Viewer area</div>
      </section>

      {/* RIGHT reserved */}
      <aside className="rounded-2xl" />
    </main>
  )
}
