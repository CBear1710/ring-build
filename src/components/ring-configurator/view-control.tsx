import { useState } from "react";
import { Button } from "../ui/button";

type ViewMode = "top" | "side" | "front" | "360";

export function ViewControl() {
  const [viewMode, setViewMode] = useState<ViewMode>("top");

  return (
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
  );
}
