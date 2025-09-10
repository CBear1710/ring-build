"use client";
import { useState } from "react";
import s from "./Metal.module.css";

const METALS = [
  { key: "white",    label: "White Gold",  color: "#d9dde3" },
  { key: "yellow",   label: "Yellow Gold", color: "#f0d36c" },
  { key: "rose",     label: "Rose Gold",   color: "#f2b0a1" },
  { key: "platinum", label: "Platinum",    color: "#f2f2f2" },
];

const PURITIES = [
  { key: "9k",  label: "9K",            delta: 0 },
  { key: "14k", label: "14K (+$800)",   delta: 800 },
  { key: "18k", label: "18K (+$1000)",  delta: 1000 },
];

export default function MetalCard({ price = 500 }) {
  const [metal, setMetal]   = useState("white");
  const [purity, setPurity] = useState("9k");

  return (
    <section className={s.card}>
      <header className={s.titleRow}>
        <div className={s.left}>
          <h2 className={s.title}>METAL</h2>
          <span className={s.subtitle}>
            {METALS.find(m => m.key === metal)?.label}
          </span>
        </div>
        <div className={s.price}>${price}</div>
      </header>

      <div className={s.swatches}>
        {METALS.map(m => (
          <button
            key={m.key}
            className={`${s.swatch} ${metal === m.key ? s.active : ""}`}
            onClick={() => setMetal(m.key)}
            title={m.label}
          >
            <span className={s.circle} style={{ backgroundColor: m.color }} />
          </button>
        ))}
      </div>

      <div className={s.subLabel}>Purity</div>
      <div className={s.pills}>
        {PURITIES.map(p => (
          <button
            key={p.key}
            className={`${s.pill} ${purity === p.key ? s.pillActive : ""}`}
            onClick={() => setPurity(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </section>
  );
}
