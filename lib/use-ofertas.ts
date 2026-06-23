"use client"

import useSWR from "swr"
import { getSupabaseClient, type Oferta, type Mercado } from "@/lib/supabase"

async function fetchDados() {
  const supabase = getSupabaseClient()

  const [ofertasRes, mercadosRes] = await Promise.all([
    supabase
      .from("ofertas")
      .select(
        "id, produto, preco, preco_antigo, unidade, mercado_id, destaque, valido_ate, status, foto_url, created_at, mercados(id, nome, bairro, logo_cor)",
      )
      .eq("status", "aprovada")
      .order("created_at", { ascending: false }),
    supabase
      .from("mercados")
      .select("id, nome, bairro, logo_cor, ativo")
      .order("nome"),
  ])

  if (ofertasRes.error) throw ofertasRes.error
  if (mercadosRes.error) throw mercadosRes.error

  return {
    ofertas: (ofertasRes.data ?? []) as unknown as Oferta[],
    mercados: (mercadosRes.data ?? []) as Mercado[],
  }
}

// Calcula o percentual de desconto de uma oferta (0 quando nao ha preco antigo).
export function calcularDesconto(o: Oferta): number {
  if (!o.preco_antigo || o.preco_antigo <= o.preco) return 0
  return Math.round(((o.preco_antigo - o.preco) / o.preco_antigo) * 100)
}

// Hook compartilhado: a chave unica deduplica as requisicoes entre as secoes.
export function useOfertas() {
  return useSWR("ofertas-mercados", fetchDados, {
    revalidateOnFocus: false,
  })
}
