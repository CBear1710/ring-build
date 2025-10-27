// "use client";

// import ArrowLeftStep from "@/assets/icons/arrow-left-step";
// import DiamondIcon from "@/assets/icons/diamond-icon";
// import RingIcon from "@/assets/icons/ring-icon";
// import RingSettingIcon from "@/assets/icons/ring-setting-icon";
// import { useRingSetting } from "@/cms/blocks/completion/components/setting-context";
// import { getURLFromDynamicLink } from "@/cms/utils";
// import {
//   CURRENT_DIAMOND_QUERY_KEY,
//   CURRENT_SETTING_QUERY_KEY,
//   VIEW_DIAMOND_QUERY_KEY,
// } from "@/lib/constants";
// import { getStorageItem, setStorageItem } from "@/lib/storage";
// import { convertToLocale } from "@/lib/util/money";
// import { cn } from "@/lib/utils";
// import { EngagementRingStepBlock as EngagementRingStepType } from "@/payload-types";
// import { useTranslations } from "next-intl";
// import Image from "next/image";
// import {
//   useParams,
//   usePathname,
//   useRouter,
//   useSearchParams,
// } from "next/navigation";
// import { useEffect } from "react";

// interface StepBarProps {
//   data: EngagementRingStepType;
//   searchParams: unknown;
// }

// export const STEP_QUERY = "step";
// export const START_WITH_QUERY = "startWith";

// export const WITH_SETTING = "withSetting" as const;
// export const WITH_STONE = "withStone" as const;

// export type StartWithType = typeof WITH_SETTING | typeof WITH_STONE;

// const orderSteps = (
//   pathname: string,
//   locale: string
// ): { startWith: StartWithType; currentStep: string } => {
//   const setting = getStorageItem(CURRENT_SETTING_QUERY_KEY, "");
//   const diamond = getStorageItem(CURRENT_DIAMOND_QUERY_KEY, "");

//   const prefix = locale === "th" ? "/th" : "";

//   if (
//     pathname === `${prefix}/engagement-rings` ||
//     pathname === `${prefix}/engagement-ring-setting-detail`
//   ) {
//     if (!setting && !diamond) {
//       setStorageItem(START_WITH_QUERY, WITH_SETTING);
//       return {
//         startWith: WITH_SETTING,
//         currentStep: "1",
//       };
//     }

//     if (!setting && diamond) {
//       setStorageItem(START_WITH_QUERY, WITH_STONE);
//       return {
//         startWith: WITH_STONE,
//         currentStep: "2",
//       };
//     }

//     if (setting && !diamond) {
//       setStorageItem(START_WITH_QUERY, WITH_SETTING);
//       return {
//         startWith: WITH_SETTING,
//         currentStep: "1",
//       };
//     }

//     if (setting && diamond) {
//       const startWith = getStorageItem<StartWithType>(
//         START_WITH_QUERY,
//         WITH_SETTING
//       );

//       if (startWith === WITH_SETTING) {
//         return {
//           startWith: WITH_SETTING,
//           currentStep: "1",
//         };
//       }

//       if (startWith === WITH_STONE) {
//         return {
//           startWith: WITH_STONE,
//           currentStep: "2",
//         };
//       }
//     }
//   }

//   if (
//     pathname === `${prefix}/diamonds` ||
//     pathname === `${prefix}/engagement-ring-diamond-detail`
//   ) {
//     if (!diamond && !setting) {
//       setStorageItem(START_WITH_QUERY, WITH_STONE);
//       return {
//         startWith: WITH_STONE,
//         currentStep: "1",
//       };
//     }

//     if (!diamond && setting) {
//       setStorageItem(START_WITH_QUERY, WITH_SETTING);
//       return {
//         startWith: WITH_SETTING,
//         currentStep: "2",
//       };
//     }

//     if (diamond && !setting) {
//       setStorageItem(START_WITH_QUERY, WITH_STONE);
//       return {
//         startWith: WITH_STONE,
//         currentStep: "1",
//       };
//     }

//     if (setting && diamond) {
//       const startWith = getStorageItem<StartWithType>(
//         START_WITH_QUERY,
//         WITH_STONE
//       );

//       if (startWith === WITH_SETTING) {
//         return {
//           startWith: WITH_SETTING,
//           currentStep: "2",
//         };
//       }

//       if (startWith === WITH_STONE) {
//         return {
//           startWith: WITH_STONE,
//           currentStep: "1",
//         };
//       }
//     }
//   }

//   if (pathname === `${prefix}/completion`) {
//     const startWith = getStorageItem<StartWithType>(
//       START_WITH_QUERY,
//       WITH_SETTING
//     );

//     return {
//       startWith: startWith,
//       currentStep: "3",
//     };
//   }

//   return {
//     startWith: WITH_SETTING,
//     currentStep: "1",
//   };
// };

// export const StepBar = ({ data }: StepBarProps) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const { locale = "en" } = useParams();

//   const t = useTranslations("engagement-ring");
//   const tDiamond = useTranslations("diamond");
//   const { diamond, price, product, images } = useRingSetting();

//   const canGoToStep3 = !!diamond && !!product;

//   const { startWith, currentStep } = orderSteps(pathname, locale as string);

//   const handleGoStep = (step: string, pathnameNavigate?: string) => {
//     if (
//       (pathname?.indexOf("diamond-detail") != -1 ||
//         pathname?.indexOf("diamonds") != -1) &&
//       pathnameNavigate?.indexOf("diamonds") != -1
//     ) {
//       const params = new URLSearchParams(searchParams);

//       params.delete(VIEW_DIAMOND_QUERY_KEY);
//       params.delete(CURRENT_DIAMOND_QUERY_KEY);
//       params.delete(CURRENT_SETTING_QUERY_KEY);

//       pathnameNavigate = `${pathnameNavigate}?${params.toString()}`;
//     }

//     router.push(`${pathnameNavigate}`);
//   };

//   const renderChooseSetting = (stepNo: number) => {
//     return (
//       <>
//         <div className="flex xl:flex-row flex-col xl:items-center items-start h-full font-semibold flex-1 ml-[10px] lg:ml-5">
//           <div className="xl:text-body-l text-base font-normal">{stepNo}</div>
//           <div className="xl:ml-5 ml-0">
//             <div className="whitespace-nowrap">{t("choose-setting")}</div>
//             {product ? (
//               <div className="font-normal xl:block hidden whitespace-nowrap text-neutral-800">{`${
//                 product.title
//               } ${t("ring")} - ${convertToLocale({
//                 amount: price?.calculated_amount || 0,
//                 currency_code: price?.currency_code || "",
//                 maximumFractionDigits: 0,
//               })}`}</div>
//             ) : (
//               <div
//                 className={cn(
//                   "font-normal whitespace-nowrap text-neutral-800",
//                   currentStep !== stepNo.toString()
//                     ? "xl:block hidden underline"
//                     : "hidden"
//                 )}
//               >
//                 {t("choose-setting-subtitle")}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center h-full gap-3 mr-2 lg:mr-4">
//           <div className="xl:block hidden">
//             {images[0]?.url ? (
//               <div>
//                 <Image
//                   src={images[0].url}
//                   alt="ring image"
//                   width={54}
//                   height={54}
//                   className="rounded-full"
//                   objectFit="contain"
//                 />
//               </div>
//             ) : (
//               <RingSettingIcon />
//             )}
//           </div>
//         </div>
//       </>
//     );
//   };

//   const renderChooseStone = (stepNo: number) => {
//     return (
//       <>
//         <div className="flex xl:flex-row flex-col xl:items-center items-start h-full font-semibold flex-1 ml-[10px] lg:ml-5">
//           <div className="font-normal xl:text-body-l text-base">{stepNo}</div>
//           <div className="xl:ml-5 ml-0">
//             <div className="whitespace-nowrap">{t("choose-stone")}</div>

//             {diamond ? (
//               <div
//                 className={cn(
//                   "font-normal xl:block hidden whitespace-nowrap text-neutral-800"
//                 )}
//               >
//                 {`${diamond?.carat?.toFixed(2)} ${tDiamond("carat")} ${
//                   diamond?.shape
//                 } ${tDiamond("diamond")}`}
//               </div>
//             ) : (
//               <div
//                 className={cn(
//                   "font-normal whitespace-nowrap text-neutral-800",
//                   currentStep !== stepNo.toString()
//                     ? "xl:block hidden underline"
//                     : "hidden"
//                 )}
//               >
//                 {t("choose-stone-subtitle")}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center h-full gap-3 mr-2 lg:mr-4">
//           <div className="xl:block hidden">
//             {diamond?.image ? (
//               <div className="w-10 h-10 overflow-hidden flex items-center justify-center relative">
//                 <Image
//                   src={diamond.image}
//                   alt="ring image"
//                   objectFit="contain"
//                   fill
//                 />
//               </div>
//             ) : (
//               <DiamondIcon />
//             )}
//           </div>
//         </div>
//       </>
//     );
//   };

//   useEffect(() => {
//     const startWith =
//       searchParams.get(START_WITH_QUERY) ||
//       getStorageItem(START_WITH_QUERY, WITH_SETTING);

//     setStorageItem(START_WITH_QUERY, startWith);
//   }, [searchParams]);

//   return (
//     <div className="flex items-center justify-between w-full h-16 bg-white border-[1px] border-neutral-400 rounded-sm py-3">
//       <div className="text-caption-s font-semibold text-neutral-800 px-8 lg:block hidden">
//         {t("design-your-ring")}
//       </div>

//       <div
//         className={cn(
//           "flex items-center w-full h-full text-[13px] flex-1 justify-between cursor-pointer",
//           currentStep === "1" ? "text-primary" : "text-neutral-800"
//         )}
//         onClick={() => {
//           handleGoStep(
//             "1",
//             getURLFromDynamicLink(
//               startWith === WITH_SETTING
//                 ? data.chooseSettingURL?.link
//                 : data.chooseStoneURL?.link
//             ) || "/"
//           );
//         }}
//       >
//         <div className="lg:block hidden">
//           <ArrowLeftStep />
//         </div>
//         {startWith === WITH_SETTING
//           ? renderChooseSetting(1)
//           : renderChooseStone(1)}
//         <ArrowLeftStep />
//       </div>

//       <div
//         className={cn(
//           "flex items-center w-full h-full text-neutral-800 text-[13px] font-semibold flex-1 justify-between cursor-pointer",
//           currentStep === "2" ? "text-primary" : "text-neutral-800"
//         )}
//         onClick={() => {
//           handleGoStep(
//             "2",
//             getURLFromDynamicLink(
//               startWith === WITH_SETTING
//                 ? data.chooseStoneURL?.link
//                 : data.chooseSettingURL?.link
//             ) || "/"
//           );
//         }}
//       >
//         {startWith === WITH_SETTING
//           ? renderChooseStone(2)
//           : renderChooseSetting(2)}
//         <ArrowLeftStep />
//       </div>

//       <div
//         className={cn(
//           "flex items-center w-full h-full text-neutral-800 text-[13px] font-semibold flex-1 justify-between cursor-pointer",
//           currentStep === "3" ? "text-primary" : "text-neutral-800",
//           canGoToStep3 ? "" : "pointer-events-none opacity-50"
//         )}
//         onClick={() => {
//           if (canGoToStep3) {
//             handleGoStep(
//               "3",
//               getURLFromDynamicLink(data.completeRingURL?.link) || "/"
//             );
//           }
//         }}
//       >
//         <div className="ml-5 flex xl:flex-row flex-col xl:items-center items-start h-full">
//           <div className="xl:ml-5 ml-0 xl:text-body-l text-base font-normal">
//             3
//           </div>
//           <div className="xl:ml-5 ml-0">
//             <div className="whitespace-nowrap">{t("complete-ring")}</div>
//             <div className="font-normal underline xl:block hidden whitespace-nowrap text-neutral-800">
//               {t("complete-ring-subtitle")}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center h-full gap-3 ml-4">
//           <div className="xl:block hidden">
//             <RingIcon />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
