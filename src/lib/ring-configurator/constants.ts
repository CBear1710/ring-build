import type { EngravingFont, MetalType, RingStyle } from "./types";
import type { Shape } from "@/store/configurator";


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
] as const satisfies ReadonlyArray<{ value: Shape; label: string; image: string }>;

export const SHAPE_TO_SRC = {
  round:    "/models/Rounds.glb",
  princess: "/models/princess.obj",
  cushion:  "/models/cushion.obj",
  oval:     "/models/oval.obj",
  radiant:  "/models/radiant.obj",
  pear:     "/models/pear.obj",
  emerald:  "/models/emerald.obj",
  marquise: "/models/marquise.obj",
  heart:    "/models/heart.obj",
  asscher:  "/models/asscher.obj",
} as const satisfies Record<Shape, string>;



export const ENGRAVING_FONTS = [
  { value: "regular", label: "Regular", fontClass: "font-sans" },
  { value: "script",  label: "Script",  fontClass: "font-serif italic" },
  { value: "italics", label: "Italics", fontClass: "font-sans italic" },
  { value: "roman",   label: "Roman",   fontClass: "font-serif" },
] as const satisfies ReadonlyArray<{
  value: EngravingFont; label: string; fontClass: string;
}>;



export const RING_SIZES = Array.from({ length: 13 }, (_, i) => {
  const size = i + 2;
  const mm = 41.5 + i * 2;
  return { value: size, label: `${size} (${mm.toFixed(1)}mm)` };
});

export const CARAT_RANGE = {
  min: 0.25,
  max: 5,
  step: 0.25,
  default: 0.5,
} as const;



export const RING_STYLES = [
  { value: "plain",      label: "Plain",       image: "/ring-styles/plain.png" },
  { value: "cathedral",  label: "Cathedral",   image: "/ring-styles/cathedral.png" },
  { value: "knife",      label: "Knife Edge",  image: "/ring-styles/knife-edge.png" },
  { value: "split",      label: "Split",       image: "/ring-styles/split.png" },
  { value: "twisted",    label: "Twisted",     image: "/ring-styles/twisted.png" },
  { value: "wide_plain", label: "Wide Plain",  image: "/ring-styles/wide-plain.png" },
] as const satisfies ReadonlyArray<{ value: RingStyle; label: string; image: string }>;

export const METAL_TYPES = [
  {
    value: "18k-white",
    label: "White Gold",
    karat: "18K",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "18k-yellow",
    label: "Yellow Gold",
    karat: "18K",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "18k-rose",
    label: "Rose Gold",
    karat: "18K",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "14k-white",
    label: "White Gold",
    karat: "14K",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "14k-yellow",
    label: "Yellow Gold",
    karat: "14K",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "14k-rose",
    label: "Rose Gold",
    karat: "14K",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "9k-white",
    label: "White Gold",
    karat: "9K",
    backgroundColor:
      "linear-gradient(106.57deg, rgba(175, 171, 171, 0.3) 0%, rgba(235, 234, 234, 0.3) 50%, rgba(175, 171, 171, 0.3) 100%)",
  },
  {
    value: "9k-yellow",
    label: "Yellow Gold",
    karat: "9K",
    backgroundColor:
      "linear-gradient(106.57deg, #B49F71 0%, #F8E2B0 50%, #B49F71 100%)",
  },
  {
    value: "9k-rose",
    label: "Rose Gold",
    karat: "9K",
    backgroundColor:
      "linear-gradient(106.57deg, #BC9683 0%, #FDD9C6 50%, #BC9683 100%)",
  },
  {
    value: "platinum",
    label: "Platinum",
    karat: "Platinum",
    backgroundColor:
      "linear-gradient(106.57deg, #AFABAB 0%, #EBEAEA 50%, #AFABAB 100%),linear-gradient(0deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45))",
  },
] as const satisfies ReadonlyArray<{
  value: MetalType; label: string; karat: string; backgroundColor: string;
}>;
