"use client";

import {
  FACEBOOK_SHARE_BASE,
  SHARE_POPUP_SIZE,
  SHARE_PARAM_KEYS,
} from "./constants";

type Params = Partial<Record<(typeof SHARE_PARAM_KEYS)[number], string | number | null | undefined>>;

export function buildShareUrl(params: Params) {
  const qs = new URLSearchParams();
  for (const k of SHARE_PARAM_KEYS) {
    const v = params[k];
    if (v != null && v !== "") qs.set(k, String(v));
  }
  const url = `${window.location.origin}${window.location.pathname}?${qs.toString()}`;
  const fbUrl = `${FACEBOOK_SHARE_BASE}${encodeURIComponent(url)}`;
  return { shareUrl: url, fbUrl };
}

export async function copyToClipboard(text: string) {
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
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function openCenteredPopup(url: string, name = "share") {
  const { width: w, height: h } = SHARE_POPUP_SIZE;
  const left = (window.screenX ?? 0) + (window.innerWidth - w) / 2;
  const top = (window.screenY ?? 0) + (window.innerHeight - h) / 2;
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
  return window.open(url, name, features);
}
