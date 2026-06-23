"use client"

import useSWR from "swr"
import { useState } from "react"
import Image from "next/image"
import { FileText, Eye, X } from "lucide-react"
import { getSupabaseClient, type Encarte } from "@/lib/supabase"

function ehPdf(url: string) {
  return url.toLowerCase().split("?")[0].endsWith(".pdf")
}

function formatarData(valor: string | null) {
  if (!valor) return null
  const d = new Date(valor.includes("T") ? valor : `${valor}T00:00:00`)
  return d.toLocaleDateString("pt-BR")
}

async function buscarEncartes(): Promise<Encarte[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("encartes")
    .select(
      "id, mercado_id, imagem_url, valido_ate, status, created_at, mercados(id, nome, bairro, logo_cor)",
    )
    .eq("status", "aprovado")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as Encarte[]) ?? []
}

export function EncartesPublicos() {
  const { data: encartes, isLoading } = useSWR("encartes-aprovados", buscarEncartes)
  const [aberto, setAberto] = useState<Encarte | null>(null)

  if (isLoading) return null
  if (!encartes || encartes.length === 0) return null

  return (
    <section id="encartes" className="px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Encartes da Semana
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Confira os encartes dos supermercados do Rio e aproveite as ofertas.
          </p>
        </header>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {encartes.map((encarte) => (
            <li
              key={encarte.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => setAberto(encarte)}
                className="group relative block aspect-[3/4] w-full overflow-hidden bg-muted"
                aria-label={`Ver encarte ${encarte.mercados?.nome ?? ""}`}
              >
                {ehPdf(encarte.imagem_url) ? (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="size-9" aria-hidden="true" />
                    <span className="text-xs font-medium">Encarte em PDF</span>
                  </span>
                ) : (
                  <Image
                    src={encarte.imagem_url || "/placeholder.svg"}
                    alt={`Encarte ${encarte.mercados?.nome ?? ""}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/30 group-hover:opacity-100">
                  <Eye className="size-6 text-background" aria-hidden="true" />
                </span>
              </button>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">
                  {encarte.mercados?.nome ?? "Mercado"}
                </p>
                {formatarData(encarte.valido_ate) && (
                  <p className="text-xs text-muted-foreground">
                    Válido até {formatarData(encarte.valido_ate)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Visualizador */}
      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setAberto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Encarte ${aberto.mercados?.nome ?? ""}`}
        >
          <button
            type="button"
            onClick={() => setAberto(null)}
            className="absolute right-4 top-4 rounded-full bg-background/20 p-2 text-background hover:bg-background/30"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {ehPdf(aberto.imagem_url) ? (
            <iframe
              src={aberto.imagem_url}
              title={`Encarte ${aberto.mercados?.nome ?? ""}`}
              className="h-[90vh] w-full max-w-3xl rounded-lg bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={aberto.imagem_url || "/placeholder.svg"}
              alt={`Encarte ${aberto.mercados?.nome ?? ""}`}
              width={800}
              height={1066}
              unoptimized
              className="max-h-[90vh] w-auto rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </section>
  )
}
