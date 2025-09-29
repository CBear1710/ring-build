import LeftPanel from "@/components/left-panel";
import UrlSync from "@/components/url-sync";
import Viewer from "@/components/viewer";
import RightPanel from "@/components/right-panel";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <UrlSync />

      <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div
          className="
            grid gap-6 lg:gap-8
            grid-cols-1
            md:grid-cols-[minmax(260px,340px)_1fr]
            lg:grid-cols-[minmax(280px,360px)_1fr_minmax(280px,360px)]
          "
        >
          {/* LEFT */}
          <aside
            className="
              order-2 md:order-1
              lg:sticky lg:top-6 self-start
              flex flex-col gap-4
            "
          >
            <LeftPanel />
          </aside>

          {/* CENTER  */}
          <section className="order-1 md:order-2">
            <div className="h-[60vh] sm:h-[70vh] lg:h-[80vh] min-h-[320px]">
              <Viewer />
            </div>
          </section>

          {/* RIGHT */}
          <aside className="order-3">
            <RightPanel />
          </aside>
        </div>
      </div>
    </main>
  );
}
