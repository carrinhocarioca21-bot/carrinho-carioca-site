"use client"

import { Store, Check, MapPin } from "lucide-react"
import { useOfertas } from "@/lib/use-ofertas"

function sigla(nome: string) {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

export function MercadosMonitorados() {
  const { data, error, isLoading } = useOfertas()
  const mercados = data?.mercados.filter((m) => m.ativo) ?? []

  return (
    <section id="mercados" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Mercados Monitorados
          </h2>
        </div>
        <p className="mt-2 text-muted-foreground">
          Acompanhamos os preços destes supermercados todos os dias.
        </p>

        {isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Carregando mercados...</p>
        )}

        {error && (
          <p className="mt-10 text-center text-destructive">
            Não foi possível carregar os mercados.
          </p>
        )}

        {!isLoading && !error && mercados.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {mercados.map((mercado) => (
              <div
                key={mercado.id}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span
                  className="flex size-14 items-center justify-center rounded-2xl text-lg font-black text-primary-foreground transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: mercado.logo_cor ?? "var(--primary)" }}
                >
                  {sigla(mercado.nome)}
                </span>
                <span className="font-semibold text-card-foreground">{mercado.nome}</span>
                {mercado.bairro && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" aria-hidden="true" />
                    {mercado.bairro}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Check className="size-3" aria-hidden="true" />
                  Ativo
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
