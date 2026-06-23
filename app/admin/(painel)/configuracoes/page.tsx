import { createClient } from "@/lib/supabase/server"
import { ConfiguracoesForm } from "@/components/admin/configuracoes-form"

export const dynamic = "force-dynamic"

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nome, email, role")
    .eq("id", user!.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Veja os dados da sua conta e altere sua senha.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Sua conta</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Nome</dt>
            <dd className="mt-0.5 font-medium">{perfil?.nome || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium">{perfil?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Nível de acesso</dt>
            <dd className="mt-0.5 font-medium capitalize">
              {perfil?.role === "master" ? "Administrador master" : "Colaborador"}
            </dd>
          </div>
        </dl>
      </section>

      <ConfiguracoesForm />
    </div>
  )
}
