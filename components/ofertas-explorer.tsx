"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Store, CalendarClock, Tag, ArrowUpDown } from "lucide-react"
import { useOfertas, calcularDesconto } from "@/lib/use-ofertas"

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatarValidade(data: string | null) {
  if (!data) return null
  const d = new Date(data + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

type Ordenacao = "menor-preco" | "maior-desconto" | "mais-recentes"

export function OfertasExplorer() {
  const { data, error, isLoading } = useOfertas()
  const [busca, setBusca] = useState("")
  const [mercadoId, setMercadoId] = useState<string>("todos")
  const [ordem, setOrdem] = useState<Ordenacao>("menor-preco")

  const ofertasFiltradas = useMemo(() => {
    if (!data) return []
    const termo = busca.trim().toLowerCase()

    const filtradas = data.ofertas.filter((o) => {
      const correspondeBusca = termo === "" || o.produto.toLowerCase().includes(termo)
      const correspondeMercado = mercadoId === "todos" || o.mercado_id === mercadoId
      return correspondeBusca && correspondeMercado
    })

    const ordenadas = [...filtradas]
    if (ordem === "menor-preco") {
      ordenadas.sort((a, b) => a.preco - b.preco)
    } else if (ordem === "maior-desconto") {
      ordenadas.sort((a, b) => calcularDesconto(b) - calcularDesconto(a))
    } else {
      ordenadas.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
      )
    }
    return ordenadas
  }, [data, busca, mercadoId, ordem])

  return (
    <section id="ofertas" className="bg-secondary/40 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Todas as Ofertas
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Pesquise produtos e compare preços nos mercados do Rio.
          </p>
        </div>

        {/* Controles de busca e filtro */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto (ex: arroz, café, leite)"
              aria-label="Buscar produto"
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-base outline-none ring-primary/30 transition focus:ring-2"
            />
          </div>
          <div className="relative sm:w-52">
            <Store
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              value={mercadoId}
              onChange={(e) => setMercadoId(e.target.value)}
              aria-label="Filtrar por mercado"
              className="h-12 w-full appearance-none rounded-xl border border-border bg-card pl-11 pr-8 text-base outline-none ring-primary/30 transition focus:ring-2"
            >
              <option value="todos">Todos os mercados</option>
              {data?.mercados.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="relative sm:w-52">
            <ArrowUpDown
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordenacao)}
              aria-label="Ordenar ofertas"
              className="h-12 w-full appearance-none rounded-xl border border-border bg-card pl-11 pr-8 text-base outline-none ring-primary/30 transition focus:ring-2"
            >
              <option value="menor-preco">Menor preço</option>
              <option value="maior-desconto">Maior desconto</option>
              <option value="mais-recentes">Mais recentes</option>
            </select>
          </div>
        </div>

        {/* Contagem de ofertas encontradas */}
        {!isLoading && !error && (
          <p className="mt-5 text-sm font-medium text-muted-foreground" aria-live="polite">
            {ofertasFiltradas.length}{" "}
            {ofertasFiltradas.length === 1 ? "oferta encontrada" : "ofertas encontradas"}
          </p>
        )}

        {/* Estados */}
        {isLoading && (
          <p className="mt-10 text-center text-muted-foreground">Carregando ofertas...</p>
        )}

        {error && (
          <p className="mt-10 text-center text-destructive">
            Não foi possível carregar as ofertas. Verifique a conexão com o Supabase.
          </p>
        )}

        {!isLoading && !error && ofertasFiltradas.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            Nenhuma oferta encontrada para esta busca.
          </p>
        )}

        {/* Lista de ofertas */}
        {!isLoading && !error && ofertasFiltradas.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ofertasFiltradas.map((o) => {
              const validade = formatarValidade(o.valido_ate)
              const desconto = calcularDesconto(o)
              return (
                <li
                  key={o.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-pretty text-lg font-semibold leading-tight">
                      {o.produto}
                    </h3>
                    {desconto > 0 ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                        -{desconto}%
                      </span>
                    ) : (
                      o.destaque && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                          <Tag className="size-3" aria-hidden="true" />
                          Destaque
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-primary">
                      {moeda.format(o.preco)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {o.unidade ?? "un"}</span>
                    {o.preco_antigo && o.preco_antigo > o.preco && (
                      <span className="text-sm text-muted-foreground line-through">
                        {moeda.format(o.preco_antigo)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Store className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {o.mercados?.nome ?? "Mercado"}
                      </span>
                    </span>
                    {o.mercados?.bairro && (
                      <span className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" aria-hidden="true" />
                        {o.mercados.bairro}
                      </span>
                    )}
                    {validade && (
                      <span className="flex items-center gap-2">
                        <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
                        Válido até {validade}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
