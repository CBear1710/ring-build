// lib/ring-configurator/constants.ts
import type { EngravingFont } from "@/lib/engraving-fonts";
import type { Metal, Purity } from "@/store/configurator";
import type { MetalType, RingStyle, StoneShape } from "./types";

export const STONE_SHAPES = [
  { value: "round",    label: "Round",    image: "/stones/round.png" },
  { value: "princess", label: "Princess", image: "/stones/princess.png" },
  { value: "cushion",  label: "Cushion",  image: "/stones/cushion.png" },
  { value: "oval",     label: "Oval",     image: "/stones/oval.png" },
  { value: "radiant",  label: "Radiant",  image: "/stones/radiant.png" },
  { value: "pear",     label: "Pear",     image: "/stones/pear.png" },
  { value: "emerald",  label: "Emerald",  image: "/stones/emerald.png" },
  { value: "marquise", label: "Marquise", image: "/stones/marquise.png" },
  { value: "heart",    label: "Heart",    image: "/stones/heart.png" },
  { value: "asscher",  label: "Asscher",  image: "/stones/asscher.png" },
] as const satisfies ReadonlyArray<{
  value: StoneShape;
  label: string;
  image: string;
}>;

export const MAX_ENGRAVING_CHARS = 15;

export const ENGRAVING_FONTS = [
  { value: "regular", label: "Regular", fontClass: "font-sans" },
  { value: "script",  label: "Script",  fontClass: "font-serif italic" },
  { value: "italics", label: "Italics", fontClass: "font-sans italic" },
  { value: "roman",   label: "Roman",   fontClass: "font-serif" },
] as const satisfies ReadonlyArray<{
  value: EngravingFont;
  label: string;
  fontClass: string;
}>;

export const ENGRAVING_FONT_PREVIEWS = [
  { value: "regular", label: "Regular", src: "/fonts/regular.png", w: 62, h: 19 },
  { value: "script",  label: "Script",  src: "/fonts/script.png",  w: 79, h: 37 },
  { value: "italics", label: "Italics", src: "/fonts/italics.png", w: 92, h: 25 },
  { value: "roman",   label: "Roman",   src: "/fonts/roman.png",   w: 75, h: 19 },
] as const satisfies ReadonlyArray<{
  value: EngravingFont;
  label: string;
  src: string;
  w: number;
  h: number;
}>;

export const RING_SIZES = Array.from({ length: 21 }, (_, i) => {
  const value = 2 + i * 0.5;
  const mm = 41.5 + i * 2;
  return { value, label: `${value} (${mm.toFixed(1)}mm)` };
});

export const CARAT_RANGE = {
  min: 0.25,
  max: 5,
  step: 0.25,
  default: 0.5,
} as const;

export const RING_STYLES: {
  value: RingStyle;
  label: string;
  image: string;
}[] = [
  { value: "plain",      label: "Plain",       image: "/ring-styles/plain.png" },
  { value: "cathedral",  label: "Cathedral",   image: "/ring-styles/cathedral.png" },
  { value: "knife",      label: "Knife Edge",  image: "/ring-styles/knife-edge.png" },
  { value: "split",      label: "Split",       image: "/ring-styles/split.png" },
  { value: "twisted",    label: "Twisted",     image: "/ring-styles/twisted.png" },
  { value: "wide_plain", label: "Wide Plain",  image: "/ring-styles/wide-plain.png" },
];

export const METAL_TYPES: {
  value: MetalType;
  label: string;
  karat: Purity;      
  metal: Metal;
  backgroundColor: string;
}[] = [
  {
    value: "18k-white",
    label: "White Gold",
    metal: "white",
    karat: "18k",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "18k-yellow",
    label: "Yellow Gold",
    metal: "yellow",
    karat: "18k",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "18k-rose",
    label: "Rose Gold",
    metal: "rose",
    karat: "18k",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "14k-white",
    label: "White Gold",
    metal: "white",
    karat: "14k",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "14k-yellow",
    label: "Yellow Gold",
    metal: "yellow",
    karat: "14k",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "14k-rose",
    label: "Rose Gold",
    metal: "rose",
    karat: "14k",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "9k-white",
    label: "White Gold",
    metal: "white",
    karat: "9k",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "9k-yellow",
    label: "Yellow Gold",
    metal: "yellow",
    karat: "9k",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "9k-rose",
    label: "Rose Gold",
    metal: "rose",
    karat: "9k",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "platinum",
    label: "Platinum",
    metal: "platinum",
    karat: null, 
    backgroundColor:
      "linear-gradient(106.57deg, #AFABAB 0%, #EBEAEA 50%, #AFABAB 100%),linear-gradient(0deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45))",
  },
];

export const FACEBOOK_SHARE_BASE =
  "https://www.facebook.com/sharer/sharer.php?u=";

export const SHARE_POPUP_SIZE = { width: 600, height: 480 } as const;

export const SHARE_PARAM_KEYS = [
  "style",
  "metal",
  "purity",
  "size",
  "shape",
  "carat",
  "engraving",
  "font",
] as const;

export const COPY_FEEDBACK_DURATION = 1200 as const;
