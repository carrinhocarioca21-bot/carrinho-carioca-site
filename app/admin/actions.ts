"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

type ActionState = { ok: boolean; error?: string }

export async function sairAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// Garante que o usuario logado e admin. Retorna o id do usuario ou lanca erro.
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!perfil?.is_admin) throw new Error("Acesso restrito a administradores.")
  return user.id
}

// Cliente com service role para escrita garantida (ignora RLS apos checagem de admin).
function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function parseOferta(formData: FormData) {
  const produto = String(formData.get("produto") ?? "").trim()
  const preco = Number(formData.get("preco"))
  const precoAntigoRaw = formData.get("preco_antigo")
  const preco_antigo =
    precoAntigoRaw && String(precoAntigoRaw).trim() !== ""
      ? Number(precoAntigoRaw)
      : null
  const mercado_id = String(formData.get("mercado_id") ?? "")
  const unidade = String(formData.get("unidade") ?? "un").trim() || "un"
  const validoRaw = formData.get("valido_ate")
  const valido_ate =
    validoRaw && String(validoRaw).trim() !== "" ? String(validoRaw) : null
  const destaque = formData.get("destaque") === "on"

  if (!produto) throw new Error("Informe o nome do produto.")
  if (!Number.isFinite(preco) || preco <= 0)
    throw new Error("Informe um preço válido.")
  if (!mercado_id) throw new Error("Selecione um mercado.")

  return { produto, preco, preco_antigo, mercado_id, unidade, valido_ate, destaque }
}

async function uploadFoto(formData: FormData): Promise<string | null> {
  const foto = formData.get("foto") as File | null
  if (!foto || foto.size === 0) return null

  const db = adminDb()
  const ext = foto.name.split(".").pop() || "jpg"
  const nome = `${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage
    .from("ofertas")
    .upload(nome, foto, { contentType: foto.type, upsert: false })
  if (error) throw new Error(`Falha no upload da foto: ${error.message}`)

  const { data } = db.storage.from("ofertas").getPublicUrl(nome)
  return data.publicUrl
}

export async function criarOferta(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin()
    const dados = parseOferta(formData)
    const foto_url = await uploadFoto(formData)
    const db = adminDb()
    const { error } = await db.from("ofertas").insert({ ...dados, foto_url })
    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/ofertas")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function atualizarOferta(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Oferta inválida.")
    const dados = parseOferta(formData)
    const novaFoto = await uploadFoto(formData)
    const db = adminDb()
    const payload = novaFoto ? { ...dados, foto_url: novaFoto } : dados
    const { error } = await db.from("ofertas").update(payload).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/ofertas")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function excluirOferta(id: string): Promise<ActionState> {
  try {
    await requireAdmin()
    const db = adminDb()
    const { error } = await db.from("ofertas").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath("/ofertas")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}
