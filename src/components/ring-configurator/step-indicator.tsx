import ArrowLeftStep from "@/icons/arrow-left-step";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="border border-[#ddd] h-[60px]">
      <div className="flex items-center gap-1 py-2">
        <div className="hidden lg:flex items-center gap-[10px]">
          <div className="text-black ml-7 text-sm text-[13px] font-semibold">
            3D Ring Configurator
          </div>
          <ArrowLeftStep />
        </div>
        <div className="flex-1 flex items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex-1 flex items-center">
              {/* Chevron separator */}
              {index > 0 && <ArrowLeftStep />}

              {/* Step content */}
              <div
                className={`cursor-pointer w-full flex flex-col md:flex-row md:items-center md:gap-5 px-[10px] ${
                  currentStep === step.number
                    ? "text-[#0313B0] font-semibold"
                    : "text-[#666]"
                }`}
              >
                <span className="text-base md:text-xl md:font-bold">
                  {step.number}
                </span>
                <span className="text-sm text-[13px] font-semibold">
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
