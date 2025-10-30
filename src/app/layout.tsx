// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { NuqsProvider } from "@/lib/nuqs";
import { Toaster } from "sonner";
import Footer from "@/components/Footer"; 

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
     
      <body className="min-h-dvh flex flex-col">
    
        <main className="flex-1">
          <Suspense fallback={null}>
            <NuqsProvider>{children}</NuqsProvider>
            <Toaster richColors position="bottom-center" />
          </Suspense>
        </main>

        
        <Footer />
      </body>
    </html>
  );
}
