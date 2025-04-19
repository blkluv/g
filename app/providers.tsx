"use client"

import useApp, { AppEnvironment } from "@/hooks/useApp"
import React from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  const app = useApp()
  return (
    <AppEnvironment.Provider value={app}>
      {children}
    </AppEnvironment.Provider>
  )
}