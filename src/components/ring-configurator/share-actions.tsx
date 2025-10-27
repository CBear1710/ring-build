/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toast } from "sonner";
import { useConfigStore } from "@/store/configurator";
import CopyLinkIcon from "@/icons/copy-link";
import FacebookIcon from "@/icons/facebook";
import { SHARE_TOAST_SUCCESS } from "@/lib/ring-configurator/constants";
import { buildShareUrl, copyToClipboard, openCenteredPopup } from "@/lib/ring-configurator/share-util";

export function ShareActions() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const purity = useConfigStore((s) => s.purity as string | number | null);
  const ringSize = useConfigStore((s) => s.ringSize);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);
  const engraving = useConfigStore((s) => s.engravingText ?? "");
  const font = useConfigStore((s: any) => (s.engravingFont ?? "regular").toLowerCase());

  async function handleCopy() {
    const { shareUrl } = buildShareUrl({
      style, metal, purity, size: ringSize, shape, carat, engraving, font,
    });
    await copyToClipboard(shareUrl);
    toast.success(SHARE_TOAST_SUCCESS);
  }

  function handleShareFacebook() {
    const { fbUrl } = buildShareUrl({
      style, metal, purity, size: ringSize, shape, carat, engraving, font,
    });
    openCenteredPopup(fbUrl, "fbshare");
  }

  return (
    <div className="flex gap-5 md:gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/20 hover:bg-black/5 transition"
        aria-label="Copy share link"
      >
        <CopyLinkIcon />
      </button>

      <button
        type="button"
        onClick={handleShareFacebook}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10 transition"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FacebookIcon />
      </button>
    </div>
  );
}
