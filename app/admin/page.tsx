import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("is_admin, nome, email")
    .eq("id", user.id)
    .single()

  if (!perfil?.is_admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-4 text-center">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta não tem permissão de administrador. Fale com o responsável
            pelo Carrinho Carioca.
          </p>
        </div>
      </main>
    )
  }

  const [{ data: ofertas }, { data: mercados }] = await Promise.all([
    supabase
      .from("ofertas")
      .select("*, mercados(id, nome, bairro, logo_cor)")
      .order("created_at", { ascending: false }),
    supabase.from("mercados").select("id, nome, bairro, logo_cor").order("nome"),
  ])

  return (
    <AdminDashboard
      adminNome={perfil.nome ?? perfil.email ?? "Administrador"}
      ofertas={ofertas ?? []}
      mercados={mercados ?? []}
    />
  )
}
