"use client";
import { useState } from "react";
import s from "./Stylecard.module.css";

const OPTIONS = [
  { key: "plain",      label: "Plain" },
  { key: "cathedral",  label: "Cathedral" },
  { key: "knife",      label: "Knife Edge" },
  { key: "split",      label: "Split" },
  { key: "twisted",    label: "Twisted" },
  { key: "wide_plain", label: "Wide Plain" },
];

export default function StyleCard({ price = 1000 }) {
  const [active, setActive] = useState("plain");

  return (
    <section className={s.card}>
      <header className={s.titleRow}>
        <div className={s.left}>
          <h2 className={s.title}>STYLE</h2>
          <span className={s.subtitle}>
            {OPTIONS.find(o => o.key === active)?.label}
          </span>
        </div>
        <div className={s.price}>${price}</div>
      </header>

      <div className={s.row}>
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.key}
            className={`${s.slot} ${active === opt.key ? s.active : ""}`}
            onClick={() => setActive(opt.key)}
            title={opt.label}
          >
            {/* Placeholder (swap with <img /> later) */}
            <div className={s.placeholder}>{i + 1}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
