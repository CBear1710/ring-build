"use client";

import { Button } from "@/components/ui/button";
import { METAL_TYPES, RING_STYLES } from "@/lib/ring-configurator/constants";
import { useConfigStore } from "@/store/configurator";
import { RotateCcw } from "lucide-react";
import Image from "next/image";

export function Step1Setting() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const purity = useConfigStore((s) => s.purity);

  const setStyle = useConfigStore((s) => s.setStyle);
  const setMetal = useConfigStore((s) => s.setMetal);
  const setPurity = useConfigStore((s) => s.setPurity);

  const selectedMetal = METAL_TYPES.find((m) => {
    return m.metal === metal && m.karat === purity;
  });

  const handleReset = () => {
    setStyle("plain");
    setMetal("white");
    setPurity("18k");
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#666]">
          Style:{" "}
          <span className="font-semibold text-[#333]">
            {RING_STYLES.find((s) => s.value === style)?.label}
          </span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-none text-sm text-black gap-2 bg-transparent border-[#ddd] hover:bg-transparent hover:opacity-90"
        >
          Reset <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-[10px] md:gap-4 mt-5">
        {RING_STYLES.map((ringStyle) => (
          <button
            key={ringStyle.value}
            onClick={() => setStyle(ringStyle.value)}
            title={ringStyle.label}
            className={`cursor-pointer flex flex-col items-center gap-1 rounded-[5px] border-2 px-[10px] pb-[10px] transition-all hover:opacity-90 ${
              style === ringStyle.value
                ? "border-[#0313B0]"
                : "bg-[#F9F9F9] border-[#ddd]"
            }`}
          >
            <Image
              width={80}
              height={80}
              src={ringStyle.image || "/placeholder.svg"}
              alt={ringStyle.label}
              className="object-cover"
            />
            <span
              className={`text-xs text-[11px] font-semibold ${
                style === ringStyle.value ? "text-[#0313B0]" : "text-[#666]"
              }`}
            >
              {ringStyle.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <h3 className="mb-4 text-base text-[#666]">
          Metal:{" "}
          <span className="font-semibold text-[#333]">
            {selectedMetal?.karat} {selectedMetal?.label}
          </span>
        </h3>

        <div className="grid grid-cols-3 gap-[10px] md:gap-4">
          {METAL_TYPES.map((metalType) => {
            const isSelected =
              metalType.metal === metal && metalType.karat === purity;

            return (
              <button
                key={metalType.value}
                onClick={() => {
                  setPurity(metalType.karat);
                  setMetal(metalType.metal);
                }}
                className={`cursor-pointer flex flex-col items-center gap-1 rounded-[5px] border-2 p-[10px] transition-all hover:opacity-90 ${
                  isSelected ? "border-[#0313B0]" : "bg-[#F9F9F9] border-[#ddd]"
                }`}
              >
                <div
                  className={`h-[30px] w-full rounded relative`}
                  style={{
                    backgroundImage: `${metalType.backgroundColor}`,
                  }}
                >
                  <div className="text-[#666] text-xs font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {metalType.karat ? metalType.karat : "Platinum"}
                  </div>
                </div>
                <div className="text-center mt-[10px]">
                  <div
                    className={`text-xs text-[11px] font-semibold ${
                      isSelected ? "text-[#0313B0]" : "text-[#666]"
                    }`}
                  >
                    {metalType.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
