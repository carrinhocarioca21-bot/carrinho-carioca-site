"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

type ActionState = { ok: boolean; error?: string }

const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"]

// Cliente com service role para escrita garantida (a RLS de ofertas so permite admin).
function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function enviarOferta(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // 1. Exige usuario logado (qualquer conta autenticada).
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Você precisa estar logado para enviar uma oferta.")

    // 2. Valida os campos.
    const produto = String(formData.get("produto") ?? "").trim()
    const preco = Number(formData.get("preco"))
    const precoAntigoRaw = formData.get("preco_antigo")
    const preco_antigo =
      precoAntigoRaw && String(precoAntigoRaw).trim() !== ""
        ? Number(precoAntigoRaw)
        : null
    const mercado_id = String(formData.get("mercado_id") ?? "")
    const foto = formData.get("foto") as File | null

    if (!foto || foto.size === 0) throw new Error("A foto da oferta é obrigatória.")
    if (!TIPOS_IMAGEM.includes(foto.type))
      throw new Error("Formato inválido. Envie uma imagem JPG, PNG ou WEBP.")
    if (!produto) throw new Error("Informe o nome do produto.")
    if (!Number.isFinite(preco) || preco <= 0)
      throw new Error("Informe um preço válido.")
    if (preco_antigo !== null && (!Number.isFinite(preco_antigo) || preco_antigo <= 0))
      throw new Error("O preço antigo informado é inválido.")
    if (!mercado_id) throw new Error("Selecione um mercado.")

    const db = adminDb()

    // 3. Upload da foto para o bucket de ofertas.
    const ext = foto.name.split(".").pop() || "jpg"
    const nomeArquivo = `${crypto.randomUUID()}.${ext}`
    const { error: uploadErro } = await db.storage
      .from("ofertas")
      .upload(nomeArquivo, foto, { contentType: foto.type, upsert: false })
    if (uploadErro) throw new Error(`Falha no upload da foto: ${uploadErro.message}`)
    const { data: pub } = db.storage.from("ofertas").getPublicUrl(nomeArquivo)

    // 4. Insere a oferta SEMPRE como pendente (envio publico, sujeito a moderacao).
    const { error } = await db.from("ofertas").insert({
      produto,
      preco,
      preco_antigo,
      mercado_id,
      foto_url: pub.publicUrl,
      status: "pendente",
    })
    if (error) throw new Error(error.message)

    // Atualiza o painel admin para o moderador ver a nova oferta pendente.
    revalidatePath("/admin/ofertas")
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao enviar a oferta.",
    }
  }
}
