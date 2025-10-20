export type RingStyle =
  | "plain"
  | "cathedral"
  | "knife"
  | "split"
  | "twisted"
  | "wide_plain";

export type MetalType =
  | "18k-white"
  | "18k-yellow"
  | "18k-rose"
  | "14k-white"
  | "14k-yellow"
  | "14k-rose"
  | "9k-white"
  | "9k-yellow"
  | "9k-rose"
  | "platinum";

export type StoneShape =
  | "round"
  | "princess"
  | "cushion"
  | "oval"
  | "radiant"
  | "pear"
  | "emerald"
  | "marquise"
  | "heart"
  | "asscher";

export type EngravingFont = "regular" | "script" | "italics" | "roman";

export interface RingConfiguration {
  // Step 1: Setting
  style: RingStyle;
  metal: MetalType;

  // Step 2: Stone
  shape: StoneShape;
  carat: number;

  // Step 3: Personalize
  size: number;
  engraving: string;
  engravingFont: EngravingFont;
}

export interface PricingBreakdown {
  basePrice: number;
  metalUpcharge: number;
  stonePrice: number;
  engravingPrice: number;
  total: number;
}
