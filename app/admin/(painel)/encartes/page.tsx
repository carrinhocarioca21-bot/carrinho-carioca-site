import { createClient } from "@/lib/supabase/server"
import { EncartesManager } from "@/components/admin/encartes-manager"
import type { Encarte, Mercado, UsuarioRole } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function EncartesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user!.id)
    .single()

  const [{ data: encartes }, { data: mercados }] = await Promise.all([
    supabase
      .from("encartes")
      .select("id, mercado_id, imagem_url, valido_ate, status, created_at, mercados(id, nome, bairro, logo_cor)")
      .order("created_at", { ascending: false }),
    supabase.from("mercados").select("id, nome, bairro, logo_cor, ativo").order("nome"),
  ])

  return (
    <EncartesManager
      role={(perfil?.role as UsuarioRole) ?? "colaborador"}
      encartes={(encartes as unknown as Encarte[]) ?? []}
      mercados={(mercados as Mercado[]) ?? []}
    />
  )
}
