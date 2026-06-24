"use client"

import useSWR from "swr"
import { useState } from "react"
import Image from "next/image"
import { FileText, Eye, ShoppingCart, CalendarDays, BadgeCheck } from "lucide-react"
import { getSupabaseClient, type Encarte } from "@/lib/supabase"
import { ehPdf, usarPaginasEncarte } from "@/lib/usar-paginas-encarte"
import { EncarteVisualizador } from "@/components/encarte-visualizador"

function formatarData(valor: string | null) {
  if (!valor) return null
  const d = new Date(valor.includes("T") ? valor : `${valor}T00:00:00`)
  return d.toLocaleDateString("pt-BR")
}

function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

async function buscarEncartes(): Promise<Encarte[]> {
  const supabase = getSupabaseClient()
  const hoje = hojeISO()
  const { data, error } = await supabase
    .from("encartes")
    .select(
      "id, mercado_id, imagem_url, valido_ate, status, created_at, mercados(id, nome, bairro, logo_cor)",
    )
    .eq("status", "aprovado")
    // Oculta automaticamente encartes expirados (validade < hoje).
    // Encartes sem data de validade continuam sempre visiveis.
    .or(`valido_ate.is.null,valido_ate.gte.${hoje}`)
    // Mais recentes primeiro; empate desempata pela maior validade.
    .order("created_at", { ascending: false })
    .order("valido_ate", { ascending: false, nullsFirst: false })
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
            <EncarteCard
              key={encarte.id}
              encarte={encarte}
              onAbrir={() => setAberto(encarte)}
            />
          ))}
        </ul>
      </div>

      {aberto && (
        <EncarteVisualizador
          url={aberto.imagem_url}
          titulo={`Encarte ${aberto.mercados?.nome ?? ""}`}
          onClose={() => setAberto(null)}
        />
      )}
    </section>
  )
}

function EncarteCard({
  encarte,
  onAbrir,
}: {
  encarte: Encarte
  onAbrir: () => void
}) {
  const paginas = usarPaginasEncarte(encarte.imagem_url)
  const validade = formatarData(encarte.valido_ate)

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onAbrir}
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

        {/* Badge ATIVO (encartes expirados nao chegam aqui) */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow">
          <BadgeCheck className="size-3" aria-hidden="true" />
          Ativo
        </span>

        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/30 group-hover:opacity-100">
          <Eye className="size-6 text-background" aria-hidden="true" />
        </span>
      </button>

      <div className="space-y-1.5 p-3">
        <p className="flex items-center gap-1.5 font-semibold leading-tight">
          <ShoppingCart className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{encarte.mercados?.nome ?? "Mercado"}</span>
        </p>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5 shrink-0" aria-hidden="true" />
          {paginas == null
            ? "Carregando..."
            : `${paginas} ${paginas === 1 ? "página" : "páginas"}`}
        </p>

        {validade && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            Válido até {validade}
          </p>
        )}
      </div>
    </li>
  )
}
