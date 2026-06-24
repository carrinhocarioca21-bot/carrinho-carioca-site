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

export type OfertaStatus = "pendente" | "aprovada" | "expirada"

export type Oferta = {
  id: string
  produto: string
  preco: number
  preco_antigo: number | null
  unidade: string | null
  mercado_id: string
  destaque: boolean
  valido_ate: string | null
  status: OfertaStatus
  foto_url: string | null
  latitude: number | null
  longitude: number | null
  bairro: string | null
  regiao: string | null
  created_at: string | null
  // join com mercados
  mercados: Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor"> | null
}

export type EncarteStatus = "pendente" | "aprovado" | "expirado"

export type Encarte = {
  id: string
  mercado_id: string
  imagem_url: string
  valido_ate: string | null
  status: EncarteStatus
  created_at: string | null
  mercados: Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor"> | null
}

export type UsuarioRole = "master" | "colaborador"

export type Usuario = {
  id: string
  nome: string | null
  email: string | null
  role: UsuarioRole
  is_admin: boolean
  ativo: boolean
  created_at: string | null
}
