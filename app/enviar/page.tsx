import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EnviarOfertaForm } from "@/components/enviar-oferta-form"
import type { Mercado } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Enviar Oferta",
  description: "Colabore enviando uma oferta que você encontrou nos mercados do Rio.",
}

export default async function EnviarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Reforco no servidor (alem do proxy): apenas usuarios logados.
  if (!user) redirect("/admin/login?next=/enviar")

  const { data: mercados } = await supabase
    .from("mercados")
    .select("id, nome, bairro, logo_cor, ativo")
    .eq("ativo", true)
    .order("nome")

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8">
      <EnviarOfertaForm mercados={(mercados as Mercado[]) ?? []} />
    </main>
  )
}
