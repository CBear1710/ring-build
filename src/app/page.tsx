import LeftPanel from "@/components/left-panel";
import UrlSync from "@/components/url-sync";
import Viewer from "@/components/viewer";
import RightPanel from "@/components/right-panel";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main
      className="
        min-h-screen bg-background
        px-6 py-6
        grid gap-7
        grid-cols-[360px_1fr_360px]
        max-[1199px]:grid-cols-[340px_1fr]
        max-[767px]:grid-cols-1
      "
    >
      <UrlSync />

      {/* LEFT */}
      <aside className="sticky top-6 self-start flex flex-col gap-4">
        <LeftPanel />
      </aside>

      {/* CENTER */}
      <section>
        <div className="h-[72vh]">
          <Viewer />
        </div>
      </section>

      {/* RIGHT: toggle + summary (client component) */}
      <RightPanel />
    </main>
  );
}
