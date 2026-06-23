"use client"

import { useMemo } from "react"
import { Flame, Medal, MapPin } from "lucide-react"
import { useOfertas, calcularDesconto } from "@/lib/use-ofertas"

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const medalhas: Record<number, { cor: string; anel: string }> = {
  1: { cor: "text-amber-500", anel: "ring-amber-400/40" },
  2: { cor: "text-slate-400", anel: "ring-slate-300/40" },
  3: { cor: "text-orange-700", anel: "ring-orange-600/30" },
}

export function TopOfertas() {
  const { data, error, isLoading } = useOfertas()

  const top10 = useMemo(() => {
    if (!data) return []
    return [...data.ofertas]
      .map((o) => ({ ...o, desconto: calcularDesconto(o) }))
      .sort((a, b) => {
        if (b.desconto !== a.desconto) return b.desconto - a.desconto
        return a.preco - b.preco
      })
      .slice(0, 10)
  }, [data])

  return (
    <section id="top-dia" className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Flame className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Top 10 Ofertas do Dia
        </h2>
      </div>
      <p className="mt-2 text-muted-foreground">
        As ofertas com os maiores descontos encontrados hoje no Rio.
      </p>

      {isLoading && (
        <p className="mt-10 text-center text-muted-foreground">Carregando ofertas...</p>
      )}

      {error && (
        <p className="mt-10 text-center text-destructive">
          Não foi possível carregar as ofertas do dia.
        </p>
      )}

      {!isLoading && !error && top10.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          Nenhuma oferta disponível no momento.
        </p>
      )}

      {!isLoading && !error && top10.length > 0 && (
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top10.map((oferta, i) => {
            const rank = i + 1
            const medalha = medalhas[rank]
            return (
              <li
                key={oferta.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {medalha ? (
                      <span
                        className={`flex size-11 items-center justify-center rounded-full bg-muted ring-2 ${medalha.anel}`}
                      >
                        <Medal className={`size-6 ${medalha.cor}`} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                        {rank}
                      </span>
                    )}
                    {oferta.desconto > 0 && (
                      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                        -{oferta.desconto}%
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                    {oferta.produto}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    <MapPin className="size-3" aria-hidden="true" />
                    {oferta.mercados?.nome ?? "Mercado"}
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <p className="text-3xl font-extrabold text-primary">
                    {moeda.format(oferta.preco)}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      /{oferta.unidade ?? "un"}
                    </span>
                  </p>
                  {oferta.preco_antigo && oferta.preco_antigo > oferta.preco && (
                    <p className="text-sm text-muted-foreground line-through">
                      {moeda.format(oferta.preco_antigo)}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
