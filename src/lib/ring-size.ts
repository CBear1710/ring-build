export function ringSizeToMm(size: number): number {
  const BASE = 41.5;      
  const PER_SIZE = 2.55;  
  return +(BASE + (size - 2) * PER_SIZE).toFixed(1);
}
