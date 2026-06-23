"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export function AdSlot({ slot, className }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignora erros antes do script carregar
    }
  }, [])

  // Sem publisher configurado: exibe um espaco reservado discreto.
  if (!ADSENSE_CLIENT) {
    return (
      <div
        className={`mx-auto flex h-24 max-w-5xl items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground ${className ?? ""}`}
        aria-hidden="true"
      >
        Espaço reservado para anúncio
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
