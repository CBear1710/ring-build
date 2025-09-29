"use client";

import { useEffect, useMemo, useState } from "react";
import SummaryPanel from "@/components/summary-panel";
import SummaryToggle from "@/components/summary-toggle";
import ViewCyclerButton from "@/components/view-cycler";

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatch(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    m.addListener?.(onChange);
    return () => {
      m.removeEventListener?.("change", onChange);
      m.removeListener?.(onChange);
    };
  }, [query]);
  return match;
}

export default function SummaryRight() {
  const isLg = useMedia("(min-width: 1024px)");
  const initialOpen = useMemo(() => isLg, [isLg]);
  const [open, setOpen] = useState<boolean>(initialOpen);

  useEffect(() => setOpen(isLg), [isLg]);

  if (!isLg) {
    return (
      <>
        {/* Floating controls on mobile: view cycler + summary toggle */}
        <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
          <ViewCyclerButton />
          <SummaryToggle onClick={() => setOpen((v) => !v)} />
        </div>

        <div
          className={[
            "fixed right-3 top-14 z-40 w-[92vw] max-w-sm",
            "transition-all duration-300 will-change-transform",
            open
              ? "opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 -translate-y-2",
          ].join(" ")}
        >
          <div className="rounded-2xl border border-black/10 bg-white shadow-xl">
            <SummaryPanel className="p-4" />
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex flex-col items-end gap-3">
        {/* Desktop header row: view cycler + toggle */}
        <div className="flex items-center gap-2">
          <ViewCyclerButton />
          <SummaryToggle onClick={() => setOpen((v) => !v)} />
        </div>

        <div
          className={[
            "transition-all duration-300 will-change-transform",
            open
              ? "opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 -translate-y-1",
          ].join(" ")}
        >
          <SummaryPanel />
        </div>
      </div>
    </aside>
  );
}
