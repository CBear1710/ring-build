"use client"

import type { RingConfiguration, PricingBreakdown } from "@/lib/ring-configurator/types"

interface PricingSummaryProps {
  configuration: RingConfiguration
}

function calculatePricing(config: RingConfiguration): PricingBreakdown {
  // Base price for plain setting
  let basePrice = 500

  // Style upcharges
  const styleUpcharges: Record<string, number> = {
    plain: 0,
    cathedral: 200,
    "knife-edge": 150,
    split: 300,
    twisted: 250,
    "wide-plain": 100,
  }
  basePrice += styleUpcharges[config.style] || 0

  // Metal upcharges
  const metalUpcharges: Record<string, number> = {
    "18k-white-gold": 0,
    "18k-yellow-gold": 0,
    "18k-rose-gold": 0,
    "14k-white-gold": -200,
    "14k-yellow-gold": -200,
    "14k-rose-gold": -200,
    "9k-white-gold": -400,
    "9k-yellow-gold": -400,
    "9k-rose-gold": -400,
    platinum: 500,
  }
  const metalUpcharge = metalUpcharges[config.metal] || 0

  // Stone pricing (exponential with carat)
  const stonePrice = Math.round(config.carat * config.carat * 2000 + config.carat * 1000)

  // Engraving price
  const engravingPrice = config.engraving ? 75 : 0

  const total = basePrice + metalUpcharge + stonePrice + engravingPrice

  return {
    basePrice,
    metalUpcharge,
    stonePrice,
    engravingPrice,
    total,
  }
}

export function PricingSummary({ configuration }: PricingSummaryProps) {
  const pricing = calculatePricing(configuration)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Pricing Breakdown</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base Setting:</span>
          <span className="font-medium text-foreground">${pricing.basePrice.toLocaleString()}</span>
        </div>

        {pricing.metalUpcharge !== 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metal Adjustment:</span>
            <span className={`font-medium ${pricing.metalUpcharge > 0 ? "text-foreground" : "text-green-600"}`}>
              {pricing.metalUpcharge > 0 ? "+" : ""}${pricing.metalUpcharge.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Diamond ({configuration.carat}ct):</span>
          <span className="font-medium text-foreground">${pricing.stonePrice.toLocaleString()}</span>
        </div>

        {pricing.engravingPrice > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Engraving:</span>
            <span className="font-medium text-foreground">${pricing.engravingPrice.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t border-border pt-2">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-foreground">Total:</span>
            <span className="font-bold text-primary">${pricing.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
        <p>Free shipping • 30-day returns • Lifetime warranty</p>
      </div>
    </div>
  )
}
