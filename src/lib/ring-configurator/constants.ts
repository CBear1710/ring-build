import type { EngravingFont, MetalType, RingStyle, StoneShape } from "./types";

export const STONE_SHAPES: Array<{
  value: StoneShape;
  label: string;
  image: string;
}> = [
  { value: "round", label: "Round", image: "/round-diamond.jpg" },
  { value: "princess", label: "Princess", image: "/princess-cut-diamond.png" },
  { value: "cushion", label: "Cushion", image: "/cushion-cut-diamond.png" },
  { value: "oval", label: "Oval", image: "/oval-diamond.png" },
  { value: "radiant", label: "Radiant", image: "/radiant-cut-diamond.jpg" },
  { value: "pear", label: "Pear", image: "/pear-shaped-diamond.jpg" },
  { value: "emerald", label: "Emerald", image: "/emerald-cut-diamond.jpg" },
  { value: "marquise", label: "Marquise", image: "/marquise-diamond.png" },
  { value: "heart", label: "Heart", image: "/heart-shaped-diamond.jpg" },
  { value: "asscher", label: "Asscher", image: "/asscher-cut-diamond.jpg" },
];

export const ENGRAVING_FONTS: Array<{
  value: EngravingFont;
  label: string;
  fontClass: string;
}> = [
  { value: "regular", label: "Regular", fontClass: "font-sans" },
  { value: "script", label: "Script", fontClass: "font-serif italic" },
  { value: "italics", label: "Italics", fontClass: "font-sans italic" },
  { value: "roman", label: "Roman", fontClass: "font-serif" },
];

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
};

export const RING_STYLES: {
  value: RingStyle;
  label: string;
  image: string;
}[] = [
  {
    value: "plain",
    label: "Plain",
    image: "/ring-styles/plain.png",
  },
  {
    value: "cathedral",
    label: "Cathedral",
    image: "/ring-styles/cathedral.png",
  },
  {
    value: "knife",
    label: "Knife Edge",
    image: "/ring-styles/knife-edge.png",
  },
  {
    value: "split",
    label: "Split",
    image: "/ring-styles/split.png",
  },
  {
    value: "twisted",
    label: "Twisted",
    image: "/ring-styles/twisted.png",
  },
  {
    value: "wide_plain",
    label: "Wide Plain",
    image: "/ring-styles/wide-plain.png",
  },
];

export const METAL_TYPES: {
  value: MetalType;
  label: string;
  karat: string;
  backgroundColor: string;
}[] = [
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
];
