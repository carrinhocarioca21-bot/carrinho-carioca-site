"use client"

import { useState, useActionState, useEffect, useMemo } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Tag,
  CheckCircle2,
  TimerOff,
  Clock,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Oferta, Mercado, OfertaStatus, UsuarioRole } from "@/lib/supabase"
import {
  criarOferta,
  atualizarOferta,
  excluirOferta,
  definirStatusOferta,
} from "@/app/admin/actions"

type MercadoLite = Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor">

type Props = {
  role: UsuarioRole
  ofertas: Oferta[]
  mercados: MercadoLite[]
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const STATUS_META: Record<
  OfertaStatus,
  { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pendente: {
    label: "Pendente",
    cls: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  aprovada: {
    label: "Aprovada",
    cls: "bg-primary/15 text-primary",
    icon: CheckCircle2,
  },
  expirada: {
    label: "Expirada",
    cls: "bg-muted text-muted-foreground",
    icon: TimerOff,
  },
}

const FILTROS: { valor: "todas" | OfertaStatus; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "pendente", label: "Pendentes" },
  { valor: "aprovada", label: "Aprovadas" },
  { valor: "expirada", label: "Expiradas" },
]

export function OfertasManager({ role, ofertas, mercados }: Props) {
  const isMaster = role === "master"
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Oferta | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [mudandoStatus, setMudandoStatus] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<"todas" | OfertaStatus>("todas")

  const filtradas = useMemo(
    () => (filtro === "todas" ? ofertas : ofertas.filter((o) => o.status === filtro)),
    [ofertas, filtro],
  )

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta oferta?")) return
    setExcluindo(id)
    await excluirOferta(id)
    setExcluindo(null)
  }

  async function handleStatus(id: string, status: OfertaStatus) {
    setMudandoStatus(id)
    await definirStatusOferta(id, status)
    setMudandoStatus(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ofertas</h1>
          <p className="text-sm text-muted-foreground">
            {ofertas.length} oferta(s) cadastrada(s)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditando(null)
            setAberto(true)
          }}
          size="lg"
          className="gap-2"
        >
          <Plus className="size-5" aria-hidden="true" />
          Nova Oferta
        </Button>
      </div>

      {/* Filtros por status */}
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            onClick={() => setFiltro(f.valor)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              filtro === f.valor
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Tag className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">Nenhuma oferta nesta categoria</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {filtradas.map((oferta) => {
            const meta = STATUS_META[oferta.status]
            const StatusIcon = meta.icon
            return (
              <li
                key={oferta.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {oferta.foto_url ? (
                      <Image
                        src={oferta.foto_url || "/placeholder.svg"}
                        alt={oferta.produto}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted-foreground">
                        <Tag className="size-6" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold">{oferta.produto}</p>
                      <span
                        className={cn(
                          "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          meta.cls,
                        )}
                      >
                        <StatusIcon className="size-3" aria-hidden="true" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {oferta.mercados?.nome ?? "Sem mercado"}
                    </p>
                    <div className="mt-auto">
                      <span className="text-lg font-bold text-primary">
                        {brl(oferta.preco)}
                      </span>
                      {oferta.preco_antigo && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {brl(oferta.preco_antigo)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {/* Aprovacao (somente master) */}
                  {isMaster && oferta.status !== "aprovada" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(oferta.id, "aprovada")}
                      disabled={mudandoStatus === oferta.id}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-8 gap-1 text-xs",
                      )}
                    >
                      {mudandoStatus === oferta.id ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="size-3" aria-hidden="true" />
                      )}
                      Aprovar
                    </button>
                  )}
                  {isMaster && oferta.status !== "expirada" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(oferta.id, "expirada")}
                      disabled={mudandoStatus === oferta.id}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-8 gap-1 text-xs",
                      )}
                    >
                      <TimerOff className="size-3" aria-hidden="true" />
                      Expirar
                    </button>
                  )}

                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Editar oferta"
                      onClick={() => {
                        setEditando(oferta)
                        setAberto(true)
                      }}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Excluir oferta"
                      onClick={() => handleExcluir(oferta.id)}
                      disabled={excluindo === oferta.id}
                    >
                      {excluindo === oferta.id ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {aberto && (
        <OfertaDialog
          oferta={editando}
          mercados={mercados}
          isMaster={isMaster}
          onClose={() => setAberto(false)}
        />
      )}
    </div>
  )
}

function OfertaDialog({
  oferta,
  mercados,
  isMaster,
  onClose,
}: {
  oferta: Oferta | null
  mercados: MercadoLite[]
  isMaster: boolean
  onClose: () => void
}) {
  const action = oferta ? atualizarOferta : criarOferta
  const [state, formAction, pending] = useActionState(action, { ok: false })

  useEffect(() => {
    if (state.ok) onClose()
  }, [state.ok, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {oferta ? "Editar oferta" : "Nova oferta"}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {oferta && <input type="hidden" name="id" value={oferta.id} />}

          <Campo label="Produto" htmlFor="produto">
            <input
              id="produto"
              name="produto"
              required
              defaultValue={oferta?.produto ?? ""}
              className={inputCls}
              placeholder="Ex: Heineken Long Neck 330ml"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Preço (R$)" htmlFor="preco">
              <input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={oferta?.preco ?? ""}
                className={inputCls}
                placeholder="9.90"
              />
            </Campo>
            <Campo label="Preço antigo" htmlFor="preco_antigo">
              <input
                id="preco_antigo"
                name="preco_antigo"
                type="number"
                step="0.01"
                min="0"
                defaultValue={oferta?.preco_antigo ?? ""}
                className={inputCls}
                placeholder="Opcional"
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Mercado" htmlFor="mercado_id">
              <select
                id="mercado_id"
                name="mercado_id"
                required
                defaultValue={oferta?.mercado_id ?? ""}
                className={inputCls}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {mercados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Unidade" htmlFor="unidade">
              <input
                id="unidade"
                name="unidade"
                defaultValue={oferta?.unidade ?? "un"}
                className={inputCls}
                placeholder="un, kg, L..."
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Válido até" htmlFor="valido_ate">
              <input
                id="valido_ate"
                name="valido_ate"
                type="date"
                defaultValue={oferta?.valido_ate ?? ""}
                className={inputCls}
              />
            </Campo>
            {isMaster ? (
              <Campo label="Status" htmlFor="status">
                <select
                  id="status"
                  name="status"
                  defaultValue={oferta?.status ?? "pendente"}
                  className={inputCls}
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="expirada">Expirada</option>
                </select>
              </Campo>
            ) : (
              <div className="flex flex-col justify-end">
                <p className="rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
                  Sua oferta ficará <strong>pendente</strong> até a aprovação do
                  administrador.
                </p>
              </div>
            )}
          </div>

          <Campo label="Foto do produto" htmlFor="foto">
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/*"
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            {oferta?.foto_url && (
              <p className="mt-1 text-xs text-muted-foreground">
                Já existe uma foto. Envie outra para substituir.
              </p>
            )}
          </Campo>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="destaque"
              defaultChecked={oferta?.destaque ?? false}
              className="size-4 rounded border-input"
            />
            Marcar como destaque
          </label>

          {state.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={pending}
              className={cn(buttonVariants({ size: "lg" }), "flex-1 gap-2")}
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {oferta ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

function Campo({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
