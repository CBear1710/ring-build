"use client";

import { Step1Setting } from "@/components/ring-configurator/step-1-setting";
import { Step2Stone } from "@/components/ring-configurator/step-2-stone";
import { Step3Personalize } from "@/components/ring-configurator/step-3-personalize";
import { StepIndicator } from "@/components/ring-configurator/step-indicator";
import { ViewControl } from "@/components/ring-configurator/view-control";
import { Button } from "@/components/ui/button";
import { ViewProvider } from "@/components/view-context";
import Viewer from "@/components/viewer";
import { useState } from "react";
import { DetailsModal } from "../details-modal";
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

  return (
    <div className="min-h-screen bg-[#f8f8f8] lg:py-16">
      <UrlSync />

      <ViewProvider>
        <div className="mx-auto bg-white max-w-[1440px] pb-16 lg:px-20 lg:py-16">
          <StepIndicator
            currentStep={currentStep}
            steps={STEPS}
            setCurrentStep={setCurrentStep}
          />

          <div className="gap-8 flex flex-col lg:flex-row md:mt-10 lg:mt-20">
            {/* Left: Ring Preview */}
            <div className="lg:w-[60%]">
              <Viewer />
              <ViewControl />
            </div>

            {/* Right: Configuration Panel */}
            <div className="flex-1 px-[15px] md:px-10 lg:px-0">
              <div className="flex flex-col">
                <div className="flex-1">
                  {currentStep === 1 && <Step1Setting />}

                  {currentStep === 2 && <Step2Stone />}

                  {currentStep === 3 && <Step3Personalize />}
                </div>

                <div className="mt-7 md:mt-10">
                  <div className="flex flex-col md:flex-row gap-5 md:gap-3">
                    <Button
                      onClick={handleNext}
                      className="cursor-pointer md:flex-1 h-11 bg-[#0313B0] text-white text-sm font-bold uppercase hover:bg-[#0313B0] hover:opacity-90"
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
