/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMemo, useState } from "react";
import { useView } from "@/components/view-context";
import { RotateCw } from "lucide-react";

const ORDER = ["Front", "Top", "Side", "360"] as const;
type Label = typeof ORDER[number];

export default function ViewCyclerButton() {
  const { setView, setView360 } = useView();

  const [idx, setIdx] = useState(0);
  const current = useMemo<Label>(() => ORDER[idx], [idx]);
  const next = useMemo<Label>(() => ORDER[(idx + 1) % ORDER.length], [idx]);

  const onClick = () => {
    if (next === "360") {
      setView360(true);           
    } else {
      setView360(false);
      setView(next.toLowerCase() as "front" | "top" | "side");
    }
    setIdx((i) => (i + 1) % ORDER.length);
  };

  return (
    <button
      onClick={onClick}
      aria-label={`View: ${current} (next: ${next})`}
      title={`View: ${current} (next: ${next})`}
      className="inline-flex items-center gap-2 rounded-xl bg-white/80 hover:bg-white shadow px-3 py-2 text-sm"
    >
      <RotateCw className="h-4 w-4" />
      <span>{current}</span>
    </button>
  );
}
