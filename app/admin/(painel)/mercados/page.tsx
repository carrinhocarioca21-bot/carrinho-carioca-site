import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MercadosManager } from "@/components/admin/mercados-manager"
import type { Mercado } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function MercadosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user!.id)
    .single()

  // Apenas master gerencia mercados.
  if (perfil?.role !== "master") redirect("/admin")

  const { data: mercados } = await supabase
    .from("mercados")
    .select("*")
    .order("nome")

  return <MercadosManager mercados={(mercados ?? []) as Mercado[]} />
}
