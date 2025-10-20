"use client";

import { Step1Setting } from "@/components/ring-configurator/step-1-setting";
import { Step2Stone } from "@/components/ring-configurator/step-2-stone";
import { Step3Personalize } from "@/components/ring-configurator/step-3-personalize";
import { StepIndicator } from "@/components/ring-configurator/step-indicator";
import { ViewControl } from "@/components/ring-configurator/view-control";
import { Button } from "@/components/ui/button";
import { ViewProvider } from "@/components/view-context";
import Viewer from "@/components/viewer";
import CopyLink from "@/icons/copy-link";
import Facebook from "@/icons/facebook";
import type { RingConfiguration } from "@/lib/ring-configurator/types";
import { useState } from "react";
import UrlSync from "../url-sync";

const STEPS = [
  { number: 1, label: "Setting" },
  { number: 2, label: "Stone" },
  { number: 3, label: "Personalize" },
];

const DEFAULT_CONFIG: RingConfiguration = {
  style: "plain",
  metal: "18k-white",
  shape: "round",
  carat: 0.5,
  size: 2,
  engraving: "",
  engravingFont: "regular",
};

export default function RingConfiguratorClient() {
  const [currentStep, setCurrentStep] = useState(1);

  const [configuration, setConfiguration] =
    useState<RingConfiguration>(DEFAULT_CONFIG);

  const updateConfiguration = (updates: Partial<RingConfiguration>) => {
    setConfiguration((prev) => ({ ...prev, ...updates }));
  };

  const resetStep = () => {
    if (currentStep === 1) {
      updateConfiguration({
        style: DEFAULT_CONFIG.style,
        metal: DEFAULT_CONFIG.metal,
      });
    } else if (currentStep === 2) {
      updateConfiguration({
        shape: DEFAULT_CONFIG.shape,
        carat: DEFAULT_CONFIG.carat,
      });
    } else if (currentStep === 3) {
      updateConfiguration({
        size: DEFAULT_CONFIG.size,
        engraving: DEFAULT_CONFIG.engraving,
        engravingFont: DEFAULT_CONFIG.engravingFont,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
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
              {/* <RingPreview configuration={configuration} /> */}
              <Viewer />

              <ViewControl />
            </div>

            {/* Right: Configuration Panel */}
            <div className="flex-1 px-[15px] md:px-10 lg:px-0">
              <div className="flex flex-col">
                <div className="flex-1">
                  {currentStep === 1 && <Step1Setting />}

                  {currentStep === 2 && (
                    <Step2Stone
                      shape={configuration.shape}
                      carat={configuration.carat}
                      onShapeChange={(shape) => updateConfiguration({ shape })}
                      onCaratChange={(carat) => updateConfiguration({ carat })}
                      onReset={resetStep}
                    />
                  )}

                  {currentStep === 3 && (
                    <Step3Personalize
                      size={configuration.size}
                      engraving={configuration.engraving}
                      engravingFont={configuration.engravingFont}
                      onSizeChange={(size) => updateConfiguration({ size })}
                      onEngravingChange={(engraving) =>
                        updateConfiguration({ engraving })
                      }
                      onEngravingFontChange={(engravingFont) =>
                        updateConfiguration({ engravingFont })
                      }
                      onReset={resetStep}
                    />
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
                      {/* Social share icons */}
                      <div className="flex gap-5 md:gap-2">
                        <CopyLink />

                        <Facebook />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ViewProvider>
    </div>
  );
}
