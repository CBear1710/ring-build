import LeftPanel from "@/components/left-panel"

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 grid gap-7 grid-cols-[360px_1fr_360px] max-[1199px]:grid-cols-[340px_1fr] max-[767px]:grid-cols-1">
      <aside className="flex flex-col gap-4 sticky top-6 self-start">
        <LeftPanel />
      </aside>

      <section className="bg-white border rounded-xl min-h-[80vh] flex items-center justify-center">
        <div className="text-gray-400">Viewer area</div>
      </section>

      <aside className="rounded-xl" />
    </main>
  )
}
