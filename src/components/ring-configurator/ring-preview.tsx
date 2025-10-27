"use client";

import { Button } from "@/components/ui/button";
import type { RingConfiguration } from "@/lib/ring-configurator/types";
import { useState } from "react";

interface RingPreviewProps {
  configuration: RingConfiguration;
}

type ViewMode = "top" | "side" | "front" | "360";

export function RingPreview({ configuration }: RingPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("top");

  // Calculate ring color based on metal type
  const getRingColor = () => {
    if (configuration.metal.includes("white"))
      return "from-gray-300 to-gray-400";
    if (configuration.metal.includes("yellow"))
      return "from-yellow-300 to-yellow-400";
    if (configuration.metal.includes("rose"))
      return "from-rose-300 to-rose-400";
    if (configuration.metal === "platinum") return "from-gray-200 to-gray-300";
    return "from-gray-300 to-gray-400";
  };

  // Calculate stone size based on carat
  const getStoneSize = () => {
    const baseSize = 60;
    return baseSize + configuration.carat * 20;
  };

  // Get stone shape path
  const getStoneShape = () => {
    const size = getStoneSize();
    const shapes: Record<string, string> = {
      round: `M ${size / 2} 0 A ${size / 2} ${size / 2} 0 1 1 ${
        size / 2
      } ${size} A ${size / 2} ${size / 2} 0 1 1 ${size / 2} 0`,
      princess: `M ${size / 2} 0 L ${size} ${size / 2} L ${
        size / 2
      } ${size} L 0 ${size / 2} Z`,
      cushion: `M ${size * 0.2} 0 L ${size * 0.8} 0 Q ${size} 0 ${size} ${
        size * 0.2
      } L ${size} ${size * 0.8} Q ${size} ${size} ${size * 0.8} ${size} L ${
        size * 0.2
      } ${size} Q 0 ${size} 0 ${size * 0.8} L 0 ${size * 0.2} Q 0 0 ${
        size * 0.2
      } 0`,
      oval: `M ${size / 2} 0 Q ${size} 0 ${size} ${
        size / 2
      } Q ${size} ${size} ${size / 2} ${size} Q 0 ${size} 0 ${size / 2} Q 0 0 ${
        size / 2
      } 0`,
      pear: `M ${size / 2} 0 Q ${size} ${size * 0.3} ${size} ${
        size * 0.7
      } Q ${size} ${size} ${size / 2} ${size} Q 0 ${size} 0 ${size * 0.7} Q 0 ${
        size * 0.3
      } ${size / 2} 0`,
      heart: `M ${size / 2} ${size * 0.3} Q 0 0 ${size * 0.25} ${
        size * 0.25
      } Q ${size / 2} ${size * 0.5} ${size / 2} ${size} Q ${size / 2} ${
        size * 0.5
      } ${size * 0.75} ${size * 0.25} Q ${size} 0 ${size / 2} ${size * 0.3}`,
      emerald: `M ${size * 0.2} 0 L ${size * 0.8} 0 L ${size} ${
        size * 0.2
      } L ${size} ${size * 0.8} L ${size * 0.8} ${size} L ${
        size * 0.2
      } ${size} L 0 ${size * 0.8} L 0 ${size * 0.2} Z`,
      marquise: `M ${size / 2} 0 Q ${size} ${size / 2} ${
        size / 2
      } ${size} Q 0 ${size / 2} ${size / 2} 0`,
      radiant: `M ${size * 0.15} 0 L ${size * 0.85} 0 L ${size} ${
        size * 0.15
      } L ${size} ${size * 0.85} L ${size * 0.85} ${size} L ${
        size * 0.15
      } ${size} L 0 ${size * 0.85} L 0 ${size * 0.15} Z`,
      asscher: `M ${size * 0.2} 0 L ${size * 0.8} 0 L ${size} ${
        size * 0.2
      } L ${size} ${size * 0.8} L ${size * 0.8} ${size} L ${
        size * 0.2
      } ${size} L 0 ${size * 0.8} L 0 ${size * 0.2} Z`,
    };
    return shapes[configuration.shape] || shapes.round;
  };

  const stoneSize = getStoneSize();

  return (
    <div className="border-b border-[#bbb] md:border-b-0 pb-5 md:pb-0">
      {/* Ring visualization */}
      <div className="relative flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {/* Outer ring */}
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className={`bg-gradient-to-br ${getRingColor()} text-transparent`}
            style={{
              fill: `url(#ringGradient)`,
            }}
          />

          {/* Inner ring shadow */}
          <ellipse
            cx="100"
            cy="100"
            rx="68"
            ry="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Stone setting */}
          <g
            transform={`translate(${100 - stoneSize / 2}, ${
              100 - stoneSize / 2
            })`}
          >
            {/* Stone shadow */}
            <path
              d={getStoneShape()}
              fill="currentColor"
              opacity="0.2"
              transform="translate(2, 2)"
            />

            {/* Main stone */}
            <path
              d={getStoneShape()}
              fill="url(#stoneGradient)"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.9"
            />

            {/* Stone sparkle */}
            <path
              d={getStoneShape()}
              fill="url(#sparkleGradient)"
              opacity="0.6"
            />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient
              id="ringGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={
                  configuration.metal.includes("yellow")
                    ? "#fde047"
                    : configuration.metal.includes("rose")
                    ? "#fda4af"
                    : "#e5e7eb"
                }
              />
              <stop
                offset="100%"
                stopColor={
                  configuration.metal.includes("yellow")
                    ? "#facc15"
                    : configuration.metal.includes("rose")
                    ? "#fb7185"
                    : "#d1d5db"
                }
              />
            </linearGradient>

            <radialGradient id="stoneGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </radialGradient>

            <radialGradient id="sparkleGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* View controls and social icons */}
      <div className="mt-7 px-[15px] lg:mt-10 w-full flex items-center justify-center">
        {/* View controls */}
        <div className="mx-auto w-[360px] grid grid-cols-4 gap-[10px] md:gap-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("top")}
            className={`cursor-pointer text-sm uppercase h-8 ${
              viewMode === "top"
                ? "border-[#0313B0] text-[#0313B0] bg-white hover:bg-white hover:text-[#0313B0]"
                : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
            }`}
          >
            TOP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("side")}
            className={`cursor-pointer text-sm uppercase h-8 ${
              viewMode === "side"
                ? "border-[#0313B0] text-[#0313B0] hover:bg-white hover:text-[#0313B0]"
                : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
            }`}
          >
            SIDE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("front")}
            className={`cursor-pointer text-sm uppercase h-8 ${
              viewMode === "front"
                ? "border-[#0313B0] text-[#0313B0] hover:bg-white"
                : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
            }`}
          >
            FRONT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("360")}
            className={`cursor-pointer text-sm uppercase h-8 ${
              viewMode === "360"
                ? "border-[#0313B0] text-[#0313B0] hover:bg-white hover:text-[#0313B0]"
                : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
            }`}
          >
            360 VIEW
          </Button>
        </div>
      </div>
    </div>
  );
}
