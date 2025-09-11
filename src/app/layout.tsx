
import "./globals.css"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { NuqsProvider } from "@/lib/nuqs"   

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <NuqsProvider>{children}</NuqsProvider>
        </Suspense>
      </body>
    </html>
  )
}
