import { Header } from "@/components/new/header";
import { NuqsProvider } from "@/lib/nuqs";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import Footer from "@/components/Footer"; 
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
     
      <body className="min-h-dvh flex flex-col">
    
        <main className="flex-1" className={plusJakartaSans.className}>
          <Suspense fallback={null}>
            <Header />
          <NuqsProvider>{children}</NuqsProvider>
            <Toaster richColors position="bottom-center" />
          </Suspense>
        </main>

        
        <Footer />
      </body>
    </html>
  );
}
