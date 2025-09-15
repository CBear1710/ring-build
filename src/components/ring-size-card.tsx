"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useConfigStore } from "@/store/configurator";
import { ringSizeToMm } from "@/lib/ring-size";

// 2.00 → 13.00 step 0.25 
const RING_SIZES = Array.from(
  { length: Math.floor(((13 - 2) / 0.25) + 1) },
  (_, i) => Number((2 + i * 0.25).toFixed(2))
);

export default function RingSizeCard() {
  const ringSize = useConfigStore(s => s.ringSize);
  const setRingSize = useConfigStore(s => s.setRingSize);

  const mm = ringSizeToMm(ringSize);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-[15px] tracking-wide">RING SIZE</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {ringSize} ({mm}mm)
            </span>
          </div>
          <Link
            href="/size-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Size Guide
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Select value={String(ringSize)} onValueChange={(v) => setRingSize(Number(v))}>
          <SelectTrigger className="h-10 rounded-lg">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {RING_SIZES.map((v) => (
              <SelectItem key={v} value={String(v)}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
