import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsuariosManager } from "@/components/admin/usuarios-manager"
import type { Usuario } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user!.id)
    .single()

  if (perfil?.role !== "master") redirect("/admin")

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: true })

  return (
    <UsuariosManager
      usuarios={(usuarios ?? []) as Usuario[]}
      meuId={user!.id}
    />
  )
}
