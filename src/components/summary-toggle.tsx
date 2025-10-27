"use client";

import { List } from "lucide-react"; 

export default function SummaryToggle({
  onClick,
  className = "",
  title = "Show summary",
}: {
  onClick: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-white hover:bg-neutral-800 shadow " +
        className
      }
      aria-label="Toggle summary"
    >
      <List size={18} />
    </button>
  );
}
