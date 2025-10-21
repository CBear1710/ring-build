"use client";

import { useState } from "react";
import { useConfigStore } from "@/store/configurator";
import CopyLink from "@/icons/copy-link";
import Facebook from "@/icons/facebook";
import {
  FACEBOOK_SHARE_BASE,
  SHARE_POPUP_SIZE,
  SHARE_PARAM_KEYS,
  COPY_FEEDBACK_DURATION,
} from "@/lib/ring-configurator/constants";

type Props = { className?: string };

export function ShareActions({ className = "" }: Props) {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const purity = useConfigStore((s) => s.purity);
  const size = useConfigStore((s) => s.ringSize);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);
  const engraving = useConfigStore((s) => s.engravingText);
  const font = useConfigStore((s) => s.engravingFont);

  const [copied, setCopied] = useState(false);

  function buildShareUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = typeof window !== "undefined" ? window.location.pathname : "";

    const config: Record<string, unknown> = {
      style,
      metal,
      purity,
      size,
      shape,
      carat,
      engraving,
      font,
    };

    const params = new URLSearchParams();
    SHARE_PARAM_KEYS.forEach((k) => {
      params.set(k, String(config[k] ?? ""));
    });

    const shareUrl = `${origin}${path}?${params.toString()}`;
    const fbUrl = `${FACEBOOK_SHARE_BASE}${encodeURIComponent(shareUrl)}`;
    return { shareUrl, fbUrl };
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  }

  function openCenteredPopup(url: string, name: string, w = 600, h = 480) {
    const dualLeft = (window.screenLeft ?? window.screenX ?? 0) as number;
    const dualTop = (window.screenTop ?? window.screenY ?? 0) as number;
    const width =
      (window.innerWidth ??
        document.documentElement.clientWidth ??
        screen.width) || 1280;
    const height =
      (window.innerHeight ??
        document.documentElement.clientHeight ??
        screen.height) || 800;

    const left = dualLeft + (width - w) / 2;
    const top = dualTop + (height - h) / 2;

    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      "menubar=0",
      "toolbar=0",
      "status=0",
      "location=0",
      "scrollbars=1",
      "resizable=1",
    ].join(",");

    const win = window.open(url, name, features);
    win?.focus?.();
  }

  async function onCopyClick() {
    const { shareUrl } = buildShareUrl();
    const ok = await copyToClipboard(shareUrl);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  }

  async function onFacebookClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const { shareUrl, fbUrl } = buildShareUrl();
    const ok = await copyToClipboard(shareUrl); 
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    openCenteredPopup(
      fbUrl,
      "fbshare",
      SHARE_POPUP_SIZE.width,
      SHARE_POPUP_SIZE.height
    );
  }

  return (
    <div className={`flex gap-5 md:gap-2 ${className}`}>
      <button
        type="button"
        onClick={onCopyClick}
        title={copied ? "Copied!" : "Copy link"}
        className="inline-flex items-center justify-center rounded-lg  hover:bg-black/5 active:scale-[0.98] transition"
        aria-label="Copy configuration link"
      >
        <CopyLink />
      </button>

      <button
        type="button"
        onClick={onFacebookClick}
        title="Share on Facebook"
        className="inline-flex items-center justify-center rounded-lg  text-[#1877F2] hover:bg-[#1877F2]/10 active:scale-[0.98] transition"
        aria-label="Share on Facebook"
      >
        <Facebook />
      </button>
    </div>
  );
}
