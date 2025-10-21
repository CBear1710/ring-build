// "use client";

// import { useView } from "@/components/view-context";
// import { animateCamera } from "@/lib/utils/camera-animation";
// import { useThree } from "@react-three/fiber";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// const SPIN_SPEED = 1.6;
// const MOBILE_BREAKPOINT = 768;
// const MOBILE_FIT_FACTOR = 1.25;
// const DESKTOP_FIT_FACTOR = 1.1;

// const DIRS = {
//   perspective: new THREE.Vector3(10, 8, -13).normalize(),
//   top: new THREE.Vector3(0, 1, 0.001).normalize(),
//   front: new THREE.Vector3(0, 0.3, 1).normalize(),
//   side: new THREE.Vector3(1, 0.3, 0).normalize(),
// };

// // The central point in the scene that the camera will always look at.
// const TARGET = new THREE.Vector3(0, 2, 0);

// export default function ViewAnimator() {
//   const { camera, size, invalidate } = useThree();
//   const { view, setView, view360, controls } = useView();

//   // Stores the name of the last active view ('perspective', 'top', etc., or 'custom').
//   const lastViewRef = useRef<keyof typeof DIRS | "custom">("perspective");
//   // Stores the cancel function for the currently active animation.
//   const cancelAnimationRef = useRef<(() => void) | null>(null);
//   // Stores the user-adjusted camera distance for each named view.
//   const storedDistRef = useRef<Record<string, number>>({
//     perspective: 12,
//     top: 10,
//     front: 10,
//     side: 10,
//   });

//   // Detects user interaction and sets the view to 'custom'.
//   useEffect(() => {
//     if (!controls) return;

//     const onStartInteraction = () => setView("custom");

//     controls.addEventListener("start", onStartInteraction);

//     return () => controls.removeEventListener("start", onStartInteraction);
//   }, [controls, setView]);

//   // Manages the 360 auto-rotation feature.
//   useEffect(() => {
//     if (!controls) return;

//     const c = controls;

//     c.autoRotate = !!view360;
//     c.autoRotateSpeed = SPIN_SPEED;

//     let animationFrameId: number | null = null;

//     const tick = () => {
//       c.update?.();

//       invalidate();

//       if (c.autoRotate) {
//         animationFrameId = requestAnimationFrame(tick);
//       }
//     };

//     if (c.autoRotate) {
//       tick();
//     } else {
//       c.update?.();
//       invalidate();
//     }

//     return () => {
//       if (animationFrameId) cancelAnimationFrame(animationFrameId);
//     };
//   }, [controls, view360, invalidate]);

//   // Animates the camera to a new named view when `view` state changes.
//   useEffect(() => {
//     if (view === "custom") {
//       lastViewRef.current = "custom";
//       return;
//     }

//     cancelAnimationRef.current?.();

//     const currentPosition = camera.position.clone();
//     const currentTarget =
//       (controls?.target as THREE.Vector3)?.clone() ?? TARGET;
//     const currentDistance = currentPosition.distanceTo(currentTarget);

//     const previousView = lastViewRef.current;
//     if (previousView !== "custom") {
//       storedDistRef.current[previousView] = currentDistance;
//     }

//     // Calculate the destination position for the new view.
//     const targetDir = DIRS[view];
//     const targetDist = storedDistRef.current[view] || currentDistance;
//     const fitFactor =
//       size.width < MOBILE_BREAKPOINT ? MOBILE_FIT_FACTOR : DESKTOP_FIT_FACTOR;
//     const goalPosition = TARGET.clone().add(
//       targetDir.clone().multiplyScalar(targetDist * fitFactor)
//     );

//     // --- Start animation ---

//     cancelAnimationRef.current = animateCamera(
//       camera as THREE.PerspectiveCamera,
//       controls,
//       currentPosition,
//       goalPosition,
//       currentTarget,
//       TARGET,
//       invalidate, // onUpdate: request re-render
//       () => {
//         // onEnd: update the last view ref
//         lastViewRef.current = view;
//         cancelAnimationRef.current = null;
//       }
//     );

//     // Cleanup: ensure the animation is cancelled if the component unmounts.
//     return () => {
//       cancelAnimationRef.current?.();
//     };
//   }, [view, camera, controls, size.width, invalidate]);

//   // This is a logic-only component, so it renders nothing.
//   return null;
// }
