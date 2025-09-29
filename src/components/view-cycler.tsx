/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMemo, useState } from "react";
import { useView } from "@/components/view-context";
import { RotateCw } from "lucide-react"; // or any icon

const Kt = ["Top", "Side", "Front", "360"] as const;
type Label = typeof Kt[number];

export default function ViewCyclerButton() {
  const { setView, setView360 } = useView();
  const [idx, setIdx] = useState(0);

  const label = useMemo<Label>(() => Kt[idx], [idx]);

  // Ke: click handler (matches the doc's logic)
  const Ke = () => {
    const l = Kt[idx];
    if (l === "360") {
      setView360(true);
    } else {
      setView360(false);
      // be(): "go to view" == set the named view; animator will do the rest
      setView(l.toLowerCase() as any); // "top" | "side" | "front"
    }
    setIdx((i) => (i + 1) % Kt.length);
  };

  const title = `View: ${label}`;

  return (
    <button
      onClick={Ke}
      aria-label={title}
      title={title}
      className="inline-flex items-center gap-2 rounded-xl bg-white/80 hover:bg-white shadow px-3 py-2 text-sm"
    >
      <RotateCw className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
