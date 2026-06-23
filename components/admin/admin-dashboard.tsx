"use client"

import { useState, useActionState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  LogOut,
  Tag,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Oferta, Mercado } from "@/lib/supabase"
import { criarOferta, atualizarOferta, excluirOferta, sairAdmin } from "@/app/admin/actions"

type Props = {
  adminNome: string
  ofertas: Oferta[]
  mercados: Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor">[]
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function AdminDashboard({ adminNome, ofertas, mercados }: Props) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Oferta | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

  function novaOferta() {
    setEditando(null)
    setAberto(true)
  }

  function editarOferta(oferta: Oferta) {
    setEditando(oferta)
    setAberto(true)
  }

  async function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta oferta?")) return
    setExcluindo(id)
    await excluirOferta(id)
    setExcluindo(null)
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingCart className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">Painel Admin</p>
              <p className="text-xs text-muted-foreground">{adminNome}</p>
            </div>
          </div>
          <form action={sairAdmin}>
            <button
              type="submit"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ofertas</h1>
            <p className="text-sm text-muted-foreground">
              {ofertas.length} oferta(s) cadastrada(s)
            </p>
          </div>
          <Button onClick={novaOferta} size="lg" className="gap-2">
            <Plus className="size-5" aria-hidden="true" />
            Nova Oferta
          </Button>
        </div>

        {ofertas.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Tag className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-medium">Nenhuma oferta ainda</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Nova Oferta&quot; para começar.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {ofertas.map((oferta) => (
              <li
                key={oferta.id}
                className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
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
                  <p className="truncate font-semibold">{oferta.produto}</p>
                  <p className="text-sm text-muted-foreground">
                    {oferta.mercados?.nome ?? "Sem mercado"}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {brl(oferta.preco)}
                      </span>
                      {oferta.preco_antigo && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {brl(oferta.preco_antigo)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Editar oferta"
                        onClick={() => editarOferta(oferta)}
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {aberto && (
        <OfertaDialog
          oferta={editando}
          mercados={mercados}
          onClose={() => setAberto(false)}
        />
      )}
    </div>
  )
}

function OfertaDialog({
  oferta,
  mercados,
  onClose,
}: {
  oferta: Oferta | null
  mercados: Pick<Mercado, "id" | "nome" | "bairro" | "logo_cor">[]
  onClose: () => void
}) {
  const action = oferta ? atualizarOferta : criarOferta
  const [state, formAction, pending] = useActionState(action, { ok: false })
  const formRef = useRef<HTMLFormElement>(null)

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

        <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-4">
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

          <Campo label="Válido até" htmlFor="valido_ate">
            <input
              id="valido_ate"
              name="valido_ate"
              type="date"
              defaultValue={oferta?.valido_ate ?? ""}
              className={inputCls}
            />
          </Campo>

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
