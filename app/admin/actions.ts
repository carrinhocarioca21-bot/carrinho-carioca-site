"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { OfertaStatus, UsuarioRole } from "@/lib/supabase"

type ActionState = { ok: boolean; error?: string }

export async function sairAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// Retorna o perfil do usuario logado (id, role, ativo) ou null.
async function getPerfil() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("id, nome, email, role, is_admin, ativo")
    .eq("id", user.id)
    .single()

  return perfil
}

// Qualquer membro ativo da equipe (master ou colaborador).
async function requireStaff() {
  const perfil = await getPerfil()
  if (!perfil || !perfil.ativo) throw new Error("Acesso restrito à equipe.")
  return perfil
}

// Apenas MASTER.
async function requireMaster() {
  const perfil = await getPerfil()
  if (!perfil || !perfil.ativo || perfil.role !== "master")
    throw new Error("Apenas o administrador master pode fazer isso.")
  return perfil
}

// Cliente com service role para escrita garantida (ignora RLS apos checagem).
function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function revalidarTudo() {
  revalidatePath("/admin", "layout")
  revalidatePath("/")
  revalidatePath("/ofertas")
}

/* ----------------------------- OFERTAS ----------------------------- */

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
  const statusRaw = String(formData.get("status") ?? "pendente")
  const status: OfertaStatus = (["pendente", "aprovada", "expirada"] as const).includes(
    statusRaw as OfertaStatus,
  )
    ? (statusRaw as OfertaStatus)
    : "pendente"

  if (!produto) throw new Error("Informe o nome do produto.")
  if (!Number.isFinite(preco) || preco <= 0)
    throw new Error("Informe um preço válido.")
  if (!mercado_id) throw new Error("Selecione um mercado.")

  return { produto, preco, preco_antigo, mercado_id, unidade, valido_ate, destaque, status }
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
    const perfil = await requireStaff()
    const dados = parseOferta(formData)
    // Colaborador nao pode aprovar: oferta nasce pendente.
    if (perfil.role !== "master") dados.status = "pendente"
    const foto_url = await uploadFoto(formData)
    const db = adminDb()
    const { error } = await db.from("ofertas").insert({ ...dados, foto_url })
    if (error) throw new Error(error.message)
    revalidarTudo()
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
    const perfil = await requireStaff()
    const id = String(formData.get("id") ?? "")
    if (!id) throw new Error("Oferta inválida.")
    const dados = parseOferta(formData)
    const novaFoto = await uploadFoto(formData)
    const db = adminDb()
    // Colaborador nao altera status; preserva o atual.
    const payload: Record<string, unknown> = { ...dados }
    if (perfil.role !== "master") delete payload.status
    if (novaFoto) payload.foto_url = novaFoto
    const { error } = await db.from("ofertas").update(payload).eq("id", id)
    if (error) throw new Error(error.message)
    revalidarTudo()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

// Master altera o status de uma oferta (aprovar / expirar / voltar a pendente).
export async function definirStatusOferta(
  id: string,
  status: OfertaStatus,
): Promise<ActionState> {
  try {
    await requireMaster()
    const db = adminDb()
    const { error } = await db.from("ofertas").update({ status }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidarTudo()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function excluirOferta(id: string): Promise<ActionState> {
  try {
    await requireStaff()
    const db = adminDb()
    const { error } = await db.from("ofertas").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidarTudo()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

/* ----------------------------- MERCADOS ----------------------------- */

export async function salvarMercado(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireMaster()
    const id = String(formData.get("id") ?? "")
    const nome = String(formData.get("nome") ?? "").trim()
    const bairro = String(formData.get("bairro") ?? "").trim() || null
    const logo_cor = String(formData.get("logo_cor") ?? "").trim() || "#16A34A"
    const ativo = formData.get("ativo") === "on"
    if (!nome) throw new Error("Informe o nome do mercado.")

    const db = adminDb()
    const payload = { nome, bairro, logo_cor, ativo }
    const { error } = id
      ? await db.from("mercados").update(payload).eq("id", id)
      : await db.from("mercados").insert(payload)
    if (error) throw new Error(error.message)
    revalidarTudo()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function excluirMercado(id: string): Promise<ActionState> {
  try {
    await requireMaster()
    const db = adminDb()
    const { error } = await db.from("mercados").delete().eq("id", id)
    if (error)
      throw new Error(
        "Não foi possível excluir. Talvez existam ofertas vinculadas a este mercado.",
      )
    revalidarTudo()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

/* ----------------------------- USUARIOS ----------------------------- */

export async function criarUsuario(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireMaster()
    const nome = String(formData.get("nome") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    const senha = String(formData.get("senha") ?? "")
    const roleRaw = String(formData.get("role") ?? "colaborador")
    const role: UsuarioRole = roleRaw === "master" ? "master" : "colaborador"

    if (!email) throw new Error("Informe o email.")
    if (senha.length < 6) throw new Error("A senha deve ter ao menos 6 caracteres.")

    const db = adminDb()
    // Cria usuario ja confirmado; o trigger insere em public.usuarios com o role.
    const { error } = await db.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome, role },
    })
    if (error) throw new Error(error.message)
    revalidatePath("/admin/usuarios")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

// Ativa/desativa um usuario (master). Desativar bloqueia o acesso ao painel.
export async function definirAtivoUsuario(
  id: string,
  ativo: boolean,
): Promise<ActionState> {
  try {
    const master = await requireMaster()
    if (id === master.id) throw new Error("Você não pode desativar a si mesmo.")
    const db = adminDb()
    const { error } = await db.from("usuarios").update({ ativo }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/usuarios")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function excluirUsuario(id: string): Promise<ActionState> {
  try {
    const master = await requireMaster()
    if (id === master.id) throw new Error("Você não pode excluir a si mesmo.")
    const db = adminDb()
    // Remove da auth; o cascade apaga public.usuarios.
    const { error } = await db.auth.admin.deleteUser(id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/usuarios")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

/* ----------------------------- ENCARTES ----------------------------- */

const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"]

async function uploadEncarte(imagem: File): Promise<string> {
  if (!TIPOS_IMAGEM.includes(imagem.type)) {
    throw new Error("Formato inválido. Envie uma imagem JPG, PNG ou WEBP.")
  }
  const db = adminDb()
  const ext = imagem.name.split(".").pop() || "jpg"
  const nome = `${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage
    .from("encartes")
    .upload(nome, imagem, { contentType: imagem.type, upsert: false })
  if (error) throw new Error(`Falha no upload do encarte: ${error.message}`)
  const { data } = db.storage.from("encartes").getPublicUrl(nome)
  return data.publicUrl
}

export async function criarEncarte(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const perfil = await requireStaff()

    const mercado_id = String(formData.get("mercado_id") ?? "")
    if (!mercado_id) throw new Error("Selecione um mercado.")

    const imagem = formData.get("imagem") as File | null
    if (!imagem || imagem.size === 0) throw new Error("Selecione uma imagem do encarte.")

    const validoRaw = formData.get("valido_ate")
    const valido_ate =
      validoRaw && String(validoRaw).trim() !== "" ? String(validoRaw) : null

    const imagem_url = await uploadEncarte(imagem)

    // Colaborador cria pendente; master pode ja aprovar.
    const status = perfil.role === "master" && formData.get("aprovar") === "on"
      ? "aprovado"
      : "pendente"

    const db = adminDb()
    const { error } = await db
      .from("encartes")
      .insert({ mercado_id, imagem_url, valido_ate, status })
    if (error) throw new Error(error.message)

    revalidatePath("/admin/encartes")
    revalidatePath("/")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao enviar encarte." }
  }
}

export async function aprovarEncarte(id: string): Promise<ActionState> {
  try {
    await requireStaff()
    const db = adminDb()
    const { error } = await db.from("encartes").update({ status: "aprovado" }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/encartes")
    revalidatePath("/")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function expirarEncarte(id: string): Promise<ActionState> {
  try {
    await requireStaff()
    const db = adminDb()
    const { error } = await db.from("encartes").update({ status: "expirado" }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/encartes")
    revalidatePath("/")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}

export async function excluirEncarte(id: string): Promise<ActionState> {
  try {
    await requireStaff()
    const db = adminDb()
    // Remove o arquivo do storage antes de apagar o registro.
    const { data: encarte } = await db
      .from("encartes")
      .select("imagem_url")
      .eq("id", id)
      .single()
    if (encarte?.imagem_url) {
      const nome = encarte.imagem_url.split("/encartes/").pop()
      if (nome) await db.storage.from("encartes").remove([nome])
    }
    const { error } = await db.from("encartes").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/encartes")
    revalidatePath("/")
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro." }
  }
}
