import { Button } from "../ui/button";
import { useView } from "../view-context";

export function ViewControl() {
  const { setView, setView360, view, view360 } = useView();

  return (
    <div className="mt-7 px-[15px] lg:mt-10 w-full flex items-center justify-center">
      {/* View controls */}
      <div className="mx-auto w-[360px] grid grid-cols-4 gap-[10px] md:gap-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setView("top");
            setView360(false);
          }}
          className={`cursor-pointer text-sm uppercase h-8 ${
            view === "top"
              ? "border-[#0313B0] text-[#0313B0] bg-white hover:bg-white hover:text-[#0313B0]"
              : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
          }`}
        >
          TOP
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setView("side");
            setView360(false);
          }}
          className={`cursor-pointer text-sm uppercase h-8 ${
            view === "side"
              ? "border-[#0313B0] text-[#0313B0] hover:bg-white hover:text-[#0313B0]"
              : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
          }`}
        >
          SIDE
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setView("front");
            setView360(false);
          }}
          className={`cursor-pointer text-sm uppercase h-8 ${
            view === "front"
              ? "border-[#0313B0] text-[#0313B0] hover:bg-white"
              : "bg-[#F9F9F9] text-[#666] border-[#ddd] hover:bg-[#F9F9F9] hover:text-[#666]"
          }`}
        >
          FRONT
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setView("360");
            setView360(true);
          }}
          className={`cursor-pointer text-sm uppercase h-8 ${
            view360
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
