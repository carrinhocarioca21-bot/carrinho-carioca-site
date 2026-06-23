import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Cliente Supabase singleton para uso no browser (componentes client).
// Usa as variaveis de ambiente publicas, configuradas no Vercel.
let client: SupabaseClient | undefined

export function getSupabaseClient() {
  if (client) return client
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return client
}

// Tipos das tabelas existentes
export type Mercado = {
  id: string
  nome: string
  bairro: string | null
  logo_cor: string | null
  ativo: boolean
}

export type Oferta = {
  id: string
  produto: string
  preco: number
  preco_antigo: number | null
  unidade: string | null
  mercado_id: string
  destaque: boolean
  valido_ate: string | null
  // join com mercados
  mercados: Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor"> | null
}
