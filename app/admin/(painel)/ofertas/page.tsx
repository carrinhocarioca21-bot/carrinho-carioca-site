import { createClient } from "@/lib/supabase/server"
import { OfertasManager } from "@/components/admin/ofertas-manager"
import type { Oferta, Mercado, UsuarioRole } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function OfertasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user!.id)
    .single()

  const [{ data: ofertas }, { data: mercados }] = await Promise.all([
    supabase
      .from("ofertas")
      .select("*, mercados(id, nome, bairro, logo_cor)")
      .order("created_at", { ascending: false }),
    supabase.from("mercados").select("id, nome, bairro, logo_cor").order("nome"),
  ])

  return (
    <OfertasManager
      role={(perfil?.role as UsuarioRole) ?? "colaborador"}
      ofertas={(ofertas ?? []) as Oferta[]}
      mercados={(mercados ?? []) as Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor">[]}
    />
  )
}
