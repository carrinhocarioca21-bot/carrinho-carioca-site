import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Tag, CheckCircle2, Clock, Store, TimerOff } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [ofertas, mercados] = await Promise.all([
    supabase.from("ofertas").select("status"),
    supabase.from("mercados").select("id", { count: "exact", head: true }),
  ])

  const lista = ofertas.data ?? []
  const total = lista.length
  const aprovadas = lista.filter((o) => o.status === "aprovada").length
  const pendentes = lista.filter((o) => o.status === "pendente").length
  const expiradas = lista.filter((o) => o.status === "expirada").length

  const cards = [
    { label: "Total de ofertas", valor: total, icon: Tag, cor: "text-foreground" },
    { label: "Aprovadas", valor: aprovadas, icon: CheckCircle2, cor: "text-primary" },
    { label: "Pendentes", valor: pendentes, icon: Clock, cor: "text-amber-600" },
    { label: "Expiradas", valor: expiradas, icon: TimerOff, cor: "text-muted-foreground" },
    { label: "Mercados", valor: mercados.count ?? 0, icon: Store, cor: "text-foreground" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Resumo do Carrinho Carioca</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <Icon className={`size-5 ${c.cor}`} aria-hidden="true" />
              <p className="mt-3 text-3xl font-bold tabular-nums">{c.valor}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          )
        })}
      </div>

      {pendentes > 0 && (
        <Link
          href="/admin/ofertas?status=pendente"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 transition-colors hover:bg-amber-100"
        >
          <Clock className="size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">
            {pendentes} oferta(s) aguardando aprovação. Clique para revisar.
          </p>
        </Link>
      )}
    </div>
  )
}
