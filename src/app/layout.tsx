import "./globals.css"
import type { ReactNode } from "react"
import { NuqsProvider } from "src/lib/nuqs"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NuqsProvider>{children}</NuqsProvider>
      </body>
    </html>
  )
}
