import type { RingConfiguration, PricingBreakdown } from "./types"

export function calculatePricing(config: RingConfiguration): PricingBreakdown {
  const basePrice = 500

  // Metal upcharge based on type
  const metalUpcharges: Record<string, number> = {
    "18k-white-gold": 200,
    "18k-yellow-gold": 200,
    "18k-rose-gold": 200,
    "14k-white-gold": 100,
    "14k-yellow-gold": 100,
    "14k-rose-gold": 100,
    "9k-white-gold": 50,
    "9k-yellow-gold": 50,
    "9k-rose-gold": 50,
    platinum: 400,
  }

  const metalUpcharge = metalUpcharges[config.metal] || 0

  // Stone price based on carat (exponential pricing)
  const stonePrice = Math.round(config.carat * config.carat * 1000)

  // Engraving price
  const engravingPrice = config.engraving ? 50 : 0

  const total = basePrice + metalUpcharge + stonePrice + engravingPrice

  return {
    basePrice,
    metalUpcharge,
    stonePrice,
    engravingPrice,
    total,
  }
}
