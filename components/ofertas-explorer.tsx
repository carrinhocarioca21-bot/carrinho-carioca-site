"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Search, MapPin, Store, CalendarClock, Tag } from "lucide-react"
import { getSupabaseClient, type Oferta, type Mercado } from "@/lib/supabase"

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatarValidade(data: string | null) {
  if (!data) return null
  const d = new Date(data + "T00:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

async function fetchDados() {
  const supabase = getSupabaseClient()

  const [ofertasRes, mercadosRes] = await Promise.all([
    supabase
      .from("ofertas")
      .select(
        "id, produto, preco, preco_antigo, unidade, mercado_id, destaque, valido_ate, mercados(id, nome, bairro, logo_cor)",
      )
      .order("destaque", { ascending: false })
      .order("preco", { ascending: true }),
    supabase.from("mercados").select("id, nome, bairro, logo_cor, ativo").order("nome"),
  ])

  if (ofertasRes.error) throw ofertasRes.error
  if (mercadosRes.error) throw mercadosRes.error

  return {
    ofertas: (ofertasRes.data ?? []) as unknown as Oferta[],
    mercados: (mercadosRes.data ?? []) as Mercado[],
  }
}

export function OfertasExplorer() {
  const { data, error, isLoading } = useSWR("ofertas-mercados", fetchDados)
  const [busca, setBusca] = useState("")
  const [mercadoId, setMercadoId] = useState<string>("todos")

  const ofertasFiltradas = useMemo(() => {
    if (!data) return []
    const termo = busca.trim().toLowerCase()
    return data.ofertas.filter((o) => {
      const correspondeBusca = termo === "" || o.produto.toLowerCase().includes(termo)
      const correspondeMercado = mercadoId === "todos" || o.mercado_id === mercadoId
      return correspondeBusca && correspondeMercado
    })
  }, [data, busca, mercadoId])

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
          <div className="relative sm:w-64">
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
        </div>

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
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ofertasFiltradas.map((o) => {
              const validade = formatarValidade(o.valido_ate)
              return (
                <li
                  key={o.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-pretty text-lg font-semibold leading-tight">
                      {o.produto}
                    </h3>
                    {o.destaque && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                        <Tag className="size-3" aria-hidden="true" />
                        Destaque
                      </span>
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
