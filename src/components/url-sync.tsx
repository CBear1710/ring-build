"use client";

import { useEffect } from "react";
import { useQueryStates } from "nuqs";
import { useConfigStore } from "@/store/configurator";
import { styleParser, metalParser, purityParser, tabParser } from "@/lib/query-parsers";

/**
 * Mount this once on pages that need deep-linking.
 */
export default function UrlSync() {
  // nuqs gives current query values and  setter for multiple keys
  const [qs, setQs] = useQueryStates({
    tab: tabParser,
    style: styleParser,
    metal: metalParser,
    purity: purityParser, // may be null
  });

  //  URL -> Store 
  useEffect(() => {
    const { setTab, setStyle, setMetal, setPurity } = useConfigStore.getState();

    // guard to avoid loop
    if (qs.tab && qs.tab !== useConfigStore.getState().tab) setTab(qs.tab);
    if (qs.style && qs.style !== useConfigStore.getState().style) setStyle(qs.style);
    if (qs.metal && qs.metal !== useConfigStore.getState().metal) setMetal(qs.metal);

    
    if (qs.purity !== undefined && qs.purity !== useConfigStore.getState().purity) {
      setPurity(qs.purity);
    }
  }, [qs]);

  //  Store -> URL 
  useEffect(() => {
    const unsub = useConfigStore.subscribe(
      (s) => ({ tab: s.tab, style: s.style, metal: s.metal, purity: s.purity }),
      (state) => {
        setQs(state, { shallow: true, history: "replace" });
      },
      { equalityFn: (a, b) =>
          a.tab === b.tab && a.style === b.style && a.metal === b.metal && a.purity === b.purity
      }
    );
    return () => unsub();
  }, [setQs]);

  return null;
}
