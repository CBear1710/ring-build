"use client";

import { Step1Setting } from "@/components/ring-configurator/step-1-setting";
import { Step2Stone } from "@/components/ring-configurator/step-2-stone";
import { Step3Personalize } from "@/components/ring-configurator/step-3-personalize";
import { StepIndicator } from "@/components/ring-configurator/step-indicator";
import { ViewControl } from "@/components/ring-configurator/view-control";
import { Button } from "@/components/ui/button";
import { ViewProvider } from "@/components/view-context";
import { useConfigStore } from "@/store/configurator";
import { useState } from "react";
import { DetailsModal } from "../details-modal";
import ThreeViewer from "../new/three-viewer";
import UrlSync from "../url-sync";
import { ShareActions } from "./share-actions";

const STEPS = [
  { number: 1, label: "Setting" },
  { number: 2, label: "Stone" },
  { number: 3, label: "Personalize" },
];

export default function RingConfiguratorClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  const setStyle = useConfigStore((s) => s.setStyle);
  const setMetal = useConfigStore((s) => s.setMetal);
  const setPurity = useConfigStore((s) => s.setPurity);
  const setShape = useConfigStore((s) => s.setShape);
  const setCarat = useConfigStore((s) => s.setCarat);
  const setRingSize = useConfigStore((s) => s.setRingSize);
  const setEngravingText = useConfigStore((s) => s.setEngravingText);
  const setEngravingFont = useConfigStore((s) => s.setEngravingFont);
  const setEngravingFontUrl = useConfigStore((s) => s.setEngravingFontUrl);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpenDetailsModal(true);
    }
  };

  const getActionButtonText = () => {
    if (currentStep === 1) return "SELECT STONE →";
    if (currentStep === 2) return "PERSONALIZE →";
    return "VIEW DETAIL";
  };

  const handleReset = () => {
    setStyle("plain");
    setMetal("white");
    setPurity("18k");
    setRingSize(2);
    setEngravingText("");
    setEngravingFont("regular");
    setEngravingFontUrl(undefined);
    setShape("round");
    setCarat(0.5);
  };

  return (
    <div className="min-h-screen [&_button]:cursor-pointer [&_[role='button']]:cursor-pointer [&_a[href]]:cursor-pointer">
      <UrlSync />

      <ViewProvider>
        <div className="mx-auto bg-white max-w-[1440px] pb-16 lg:px-20 lg:pb-16 pt-10">
          <StepIndicator
            currentStep={currentStep}
            steps={STEPS}
            setCurrentStep={setCurrentStep}
          />

          <div className="gap-8 flex flex-col lg:flex-row md:mt-10 lg:mt-20">
            {/* Left: Ring Preview */}
            <div className="lg:w-[60%]">
              <ThreeViewer />
              <ViewControl />
            </div>

            {/* Right: Configuration Panel */}
            <div className="flex-1 px-[15px] md:px-10 lg:px-0">
              <div className="flex flex-col">
                <div className="flex-1">
                  {currentStep === 1 && <Step1Setting onReset={handleReset} />}
                  {currentStep === 2 && <Step2Stone onReset={handleReset} />}
                  {currentStep === 3 && (
                    <Step3Personalize onReset={handleReset} />
                  )}
                </div>

                <div className="mt-7 md:mt-10">
                  <div className="flex flex-col md:flex-row gap-5 md:gap-3">
                    <Button
                      onClick={handleNext}
                      className="md:flex-1 h-11 bg-[#0313B0] text-white text-sm font-bold uppercase hover:bg-[#0313B0] hover:opacity-90"
                      size="lg"
                    >
                      {getActionButtonText()}
                    </Button>

                    <div className="mx-auto">
                      <ShareActions />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DetailsModal
          open={openDetailsModal}
          onClose={() => setOpenDetailsModal(false)}
        />
      </ViewProvider>
    </div>
  );
}
