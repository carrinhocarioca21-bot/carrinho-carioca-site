import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import type { UsuarioRole } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nome, email, role, ativo")
    .eq("id", user.id)
    .single()

  // Apenas usuarios cadastrados pelo MASTER e ativos acessam o painel.
  if (!perfil || !perfil.ativo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-4 text-center">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-lg font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta não tem permissão de acesso ao painel. Fale com o
            administrador do Carrinho Carioca.
          </p>
          <form action="/admin/login" className="mt-4">
            <a
              href="/admin/login"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Voltar ao login
            </a>
          </form>
        </div>
      </main>
    )
  }

  const role = perfil.role as UsuarioRole
  const nome = perfil.nome ?? perfil.email ?? "Usuário"

  return (
    <div className="min-h-screen bg-secondary">
      <AdminSidebar nome={nome} role={role} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
