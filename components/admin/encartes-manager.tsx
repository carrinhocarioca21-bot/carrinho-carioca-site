"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Upload,
  Trash2,
  Loader2,
  ImageIcon,
  FileText,
  CheckCircle2,
  TimerOff,
  Clock,
  ShoppingCart,
  CalendarDays,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Encarte, Mercado, EncarteStatus, UsuarioRole } from "@/lib/supabase"
import { ehPdf, usarPaginasEncarte } from "@/lib/usar-paginas-encarte"
import { EncarteVisualizador } from "@/components/encarte-visualizador"
import {
  criarEncarte,
  aprovarEncarte,
  expirarEncarte,
  excluirEncarte,
} from "@/app/admin/actions"

type Props = {
  role: UsuarioRole
  encartes: Encarte[]
  mercados: Mercado[]
}

const STATUS_INFO: Record<
  EncarteStatus,
  { label: string; classe: string; Icon: typeof Clock }
> = {
  pendente: {
    label: "Pendente",
    classe: "bg-amber-100 text-amber-800",
    Icon: Clock,
  },
  aprovado: {
    label: "Aprovado",
    classe: "bg-primary/15 text-primary",
    Icon: CheckCircle2,
  },
  expirado: {
    label: "Expirado",
    classe: "bg-muted text-muted-foreground",
    Icon: TimerOff,
  },
}

function formatarData(valor: string | null) {
  if (!valor) return "—"
  const d = new Date(valor.includes("T") ? valor : `${valor}T00:00:00`)
  return d.toLocaleDateString("pt-BR")
}

function estaExpiradoPorData(valido_ate: string | null) {
  if (!valido_ate) return false
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const validade = new Date(`${valido_ate}T00:00:00`)
  return validade < hoje
}

export function EncartesManager({ role, encartes, mercados }: Props) {
  const isMaster = role === "master"
  const [filtro, setFiltro] = useState<EncarteStatus | "todos">("todos")
  const [preview, setPreview] = useState<string | null>(null)
  const [previewPdf, setPreviewPdf] = useState(false)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, pending] = useActionState(criarEncarte, { ok: false })

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPreview(null)
      setPreviewPdf(false)
      setErroArquivo(null)
    }
  }, [state.ok])

  function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setErroArquivo(null)
    if (!file) {
      setPreview(null)
      setPreviewPdf(false)
      return
    }
    const tiposOk = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!tiposOk.includes(file.type)) {
      setErroArquivo("Formato inválido. Use JPG, PNG, WEBP ou PDF.")
      setPreview(null)
      setPreviewPdf(false)
      e.target.value = ""
      return
    }
    const MAX_MB = 14
    if (file.size > MAX_MB * 1024 * 1024) {
      setErroArquivo(
        `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). O limite é ${MAX_MB} MB.`,
      )
      setPreview(null)
      setPreviewPdf(false)
      e.target.value = ""
      return
    }
    setPreviewPdf(file.type === "application/pdf")
    setPreview(URL.createObjectURL(file))
  }

  const lista =
    filtro === "todos" ? encartes : encartes.filter((e) => e.status === filtro)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Encartes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Faça upload dos encartes dos mercados (imagem JPG, PNG, WEBP ou PDF).
        </p>
      </header>

      {/* Formulario de upload */}
      <form
        ref={formRef}
        action={formAction}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Novo encarte</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="mercado_id" className="mb-1.5 block text-sm font-medium">
                Mercado
              </label>
              <select
                id="mercado_id"
                name="mercado_id"
                required
                defaultValue=""
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Selecione um mercado
                </option>
                {mercados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                    {m.bairro ? ` — ${m.bairro}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="valido_ate" className="mb-1.5 block text-sm font-medium">
                Data de validade
              </label>
              <input
                id="valido_ate"
                name="valido_ate"
                type="date"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="imagem" className="mb-1.5 block text-sm font-medium">
                Arquivo do encarte
              </label>
              <input
                id="imagem"
                name="imagem"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                onChange={aoEscolherArquivo}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
              />
              {erroArquivo && (
                <p className="mt-1.5 text-sm text-destructive">{erroArquivo}</p>
              )}
            </div>

            {isMaster && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="aprovar"
                  className="size-4 rounded border-input"
                />
                Aprovar imediatamente
              </label>
            )}
          </div>

          {/* Pre-visualizacao */}
          <div>
            <span className="mb-1.5 block text-sm font-medium">Pré-visualização</span>
            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              {preview && previewPdf ? (
                <object data={preview} type="application/pdf" className="h-full w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="size-8" aria-hidden="true" />
                    <span className="text-xs">PDF selecionado</span>
                  </div>
                </object>
              ) : preview ? (
                <Image
                  src={preview || "/placeholder.svg"}
                  alt="Pré-visualização do encarte"
                  width={400}
                  height={533}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-8" aria-hidden="true" />
                  <span className="text-xs">O arquivo aparecerá aqui</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {state.error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ size: "lg" }), "mt-5 gap-2")}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          Enviar encarte
        </button>
      </form>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "aprovado", "expirado"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              filtro === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de encartes */}
      {lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum encarte {filtro !== "todos" ? `${filtro}` : "enviado"} ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((encarte) => (
            <EncarteCard key={encarte.id} encarte={encarte} />
          ))}
        </ul>
      )}
    </div>
  )
}

function EncarteCard({ encarte }: { encarte: Encarte }) {
  const [aberto, setAberto] = useState(false)
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null)
  const info = STATUS_INFO[encarte.status]
  const paginas = usarPaginasEncarte(encarte.imagem_url)
  const expiradoPorData = estaExpiradoPorData(encarte.valido_ate)

  async function executar(fn: () => Promise<{ ok: boolean; error?: string }>, nome: string) {
    setAcaoPendente(nome)
    const res = await fn()
    setAcaoPendente(null)
    if (!res.ok && res.error) alert(res.error)
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="relative aspect-[3/4] overflow-hidden bg-muted"
      >
        {ehPdf(encarte.imagem_url) ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-10" aria-hidden="true" />
            <span className="text-xs font-medium">Encarte em PDF</span>
          </span>
        ) : (
          <Image
            src={encarte.imagem_url || "/placeholder.svg"}
            alt={`Encarte ${encarte.mercados?.nome ?? ""}`}
            fill
            unoptimized
            className="object-cover transition-transform hover:scale-105"
          />
        )}
        <span
          className={cn(
            "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            info.classe,
          )}
        >
          <info.Icon className="size-3" aria-hidden="true" />
          {info.label}
        </span>
        {/* Badge de validade: ATIVO (verde) ou EXPIRADO (cinza) */}
        <span
          className={cn(
            "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            expiradoPorData
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {expiradoPorData ? "Expirado" : "Ativo"}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 font-semibold leading-tight">
            <ShoppingCart className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{encarte.mercados?.nome ?? "Mercado"}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
            {paginas == null
              ? "Carregando..."
              : `${paginas} ${paginas === 1 ? "página" : "páginas"}`}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            Válido até {formatarData(encarte.valido_ate)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            Enviado em {formatarData(encarte.created_at)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {encarte.status !== "aprovado" && (
            <Button
              size="sm"
              onClick={() => executar(() => aprovarEncarte(encarte.id), "aprovar")}
              disabled={acaoPendente !== null}
              className="gap-1.5"
            >
              {acaoPendente === "aprovar" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
              )}
              Aprovar
            </Button>
          )}
          {encarte.status === "aprovado" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => executar(() => expirarEncarte(encarte.id), "expirar")}
              disabled={acaoPendente !== null}
              className="gap-1.5"
            >
              <TimerOff className="size-3.5" aria-hidden="true" />
              Expirar
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm("Excluir este encarte?")) {
                executar(() => excluirEncarte(encarte.id), "excluir")
              }
            }}
            disabled={acaoPendente !== null}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            {acaoPendente === "excluir" ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-3.5" aria-hidden="true" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      {aberto && (
        <EncarteVisualizador
          url={encarte.imagem_url}
          titulo={`Encarte ${encarte.mercados?.nome ?? ""}`}
          onClose={() => setAberto(false)}
        />
      )}
    </li>
  )
}
