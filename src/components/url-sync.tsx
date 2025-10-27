// components/ui/url-sync.tsx
"use client";

import {
  caratParser,
  engravingFontParser,
  engravingTextParser,
  metalParser,
  purityParser,
  ringSizeParser,
  shapeParser,
  styleParser,
  tabParser,
} from "@/lib/query-parsers";
import { useConfigStore } from "@/store/configurator";
import { useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";

export default function UrlSync() {
  const [qs, setQs] = useQueryStates({
    tab: tabParser,
    style: styleParser,
    metal: metalParser,
    purity: purityParser,
    shape: shapeParser,
    carat: caratParser,
    engraving: engravingTextParser,
    font: engravingFontParser,
    size: ringSizeParser,
  });

  const raw = useSearchParams();

  const {
    setTab,
    setStyle,
    setMetal,
    setPurity,
    setShape,
    setCarat,
    setEngravingText,
    setEngravingFont,
    setRingSize,
  } = useConfigStore.getState();

  const hydrated = useRef(false);

  useEffect(() => {
    const s = useConfigStore.getState();

    if (qs.tab && qs.tab !== s.tab) setTab(qs.tab);
    if (qs.style && qs.style !== s.style) setStyle(qs.style);
    if (qs.metal && qs.metal !== s.metal) setMetal(qs.metal);
    if (qs.shape) setShape(qs.shape);

    if (qs.carat != null) setCarat(qs.carat);
    if (qs.size != null) setRingSize(qs.size);

    // Handle purity: only set from URL if metal is not platinum
    if (
      qs.purity !== undefined &&
      qs.purity !== s.purity &&
      s.metal !== "platinum"
    ) {
      setPurity(qs.purity);
    }
    if (qs.engraving !== undefined) setEngravingText(qs.engraving);
    if (qs.font != null) setEngravingFont(qs.font);

    if (qs.size == null) {
      const altSize = raw.get("ringSize");
      if (altSize != null) {
        const parsed = ringSizeParser.parse(altSize);
        if (parsed != null) setRingSize(parsed);
      }
    }

    if (qs.font == null) {
      const altFont = raw.get("engravingFont");
      if (altFont != null) {
        const parsed = engravingFontParser.parse(altFont);
        if (parsed != null) setEngravingFont(parsed);
      }
    }

    if (!hydrated.current) hydrated.current = true;
  }, [
    qs,
    raw,
    setCarat,
    setEngravingFont,
    setEngravingText,
    setMetal,
    setPurity,
    setRingSize,
    setShape,
    setStyle,
    setTab,
  ]);

  useEffect(() => {
    const unsub = useConfigStore.subscribe(
      (s) => ({
        tab: s.tab,
        style: s.style,
        metal: s.metal,
        purity: s.purity,
        shape: s.shape,
        carat: s.carat,
        engraving: s.engravingText,
        font: s.engravingFont,
        size: s.ringSize,
      }),
      (state) => {
        if (!hydrated.current) return;
        setQs(state, { shallow: true, history: "replace" });
      },
      {
        equalityFn: (a, b) =>
          a.tab === b.tab &&
          a.style === b.style &&
          a.metal === b.metal &&
          a.purity === b.purity &&
          a.shape === b.shape &&
          a.carat === b.carat &&
          a.engraving === b.engraving &&
          a.font === b.font &&
          a.size === b.size,
      }
    );
    return () => unsub();
  }, [setQs]);

  return null;
}
