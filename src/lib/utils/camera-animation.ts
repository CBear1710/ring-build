import * as THREE from "three";
import type { OrbitControls } from "three-stdlib";

const ANIMATION_DURATION_MS = 500;

/**
 * An ease-out cubic easing function.
 * Makes the animation start fast and slow down towards the end.
 * @param t - Progress ratio from 0.0 to 1.0.
 * @returns The eased progress ratio.
 */
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * Animates a THREE.js camera and its controls to a target position and orientation.
 *
 * @param camera - The THREE.PerspectiveCamera instance to animate.
 * @param controls - The OrbitControls instance to update.
 * @param startPos - The starting position vector of the camera.
 * @param endPos - The destination position vector of the camera.
 * @param startTarget - The starting target vector the camera is looking at.
 * @param endTarget - The destination target vector for the camera to look at.
 * @param onUpdate - A callback function to execute on each animation frame (e.g., to invalidate the renderer).
 * @param onEnd - A callback function to execute when the animation is complete.
 * @returns A function that can be called to cancel the ongoing animation.
 */
export function animateCamera(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  startPos: THREE.Vector3,
  endPos: THREE.Vector3,
  startTarget: THREE.Vector3,
  endTarget: THREE.Vector3,
  onUpdate: () => void,
  onEnd: () => void
): () => void {
  let animationFrameId: number | null = null;
  const startTime = performance.now();

  if (controls) controls.enabled = false;

  const step = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / ANIMATION_DURATION_MS, 1);
    const easedProgress = easeOutCubic(progress);

    // Interpolate the camera's position from start to end.
    camera.position.lerpVectors(startPos, endPos, easedProgress);

    // Interpolate the control's target from start to end.
    if (controls?.target) {
      controls.target.lerpVectors(startTarget, endTarget, easedProgress);
    }

    // Update matrices and request a re-render.
    camera.updateProjectionMatrix();
    controls?.update?.();
    onUpdate();

    // Continue the loop until the animation is complete.
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      // Re-enable user controls and fire the onEnd callback.
      if (controls) controls.enabled = true;
      onEnd();
    }
  };

  // Start the animation loop.
  animationFrameId = requestAnimationFrame(step);

  // Return a function to allow canceling the animation prematurely.
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      // Ensure controls are re-enabled if animation is cancelled.
      if (controls) controls.enabled = true;
    }
  };
}
