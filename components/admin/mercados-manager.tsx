"use client"

import { useState, useActionState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Loader2, Store } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Mercado } from "@/lib/supabase"
import { salvarMercado, excluirMercado } from "@/app/admin/actions"

export function MercadosManager({ mercados }: { mercados: Mercado[] }) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Mercado | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

  async function handleExcluir(id: string) {
    if (!confirm("Excluir este mercado?")) return
    setExcluindo(id)
    const res = await excluirMercado(id)
    setExcluindo(null)
    if (!res.ok && res.error) alert(res.error)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mercados</h1>
          <p className="text-sm text-muted-foreground">
            {mercados.length} mercado(s) monitorado(s)
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
          Novo Mercado
        </Button>
      </div>

      {mercados.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Store className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">Nenhum mercado cadastrado</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {mercados.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
            >
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: m.logo_cor ?? "#16A34A" }}
                aria-hidden="true"
              >
                {m.nome.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {m.bairro ?? "—"} · {m.ativo ? "Ativo" : "Inativo"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Editar mercado"
                  onClick={() => {
                    setEditando(m)
                    setAberto(true)
                  }}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Excluir mercado"
                  onClick={() => handleExcluir(m.id)}
                  disabled={excluindo === m.id}
                >
                  {excluindo === m.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aberto && (
        <MercadoDialog mercado={editando} onClose={() => setAberto(false)} />
      )}
    </div>
  )
}

function MercadoDialog({
  mercado,
  onClose,
}: {
  mercado: Mercado | null
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(salvarMercado, { ok: false })

  useEffect(() => {
    if (state.ok) onClose()
  }, [state.ok, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {mercado ? "Editar mercado" : "Novo mercado"}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {mercado && <input type="hidden" name="id" value={mercado.id} />}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              required
              defaultValue={mercado?.nome ?? ""}
              className={inputCls}
              placeholder="Ex: Supermercado Guanabara"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bairro" className="text-sm font-medium">
                Bairro
              </label>
              <input
                id="bairro"
                name="bairro"
                defaultValue={mercado?.bairro ?? ""}
                className={inputCls}
                placeholder="Barra"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="logo_cor" className="text-sm font-medium">
                Cor do logo
              </label>
              <input
                id="logo_cor"
                name="logo_cor"
                type="color"
                defaultValue={mercado?.logo_cor ?? "#16A34A"}
                className="h-11 w-full cursor-pointer rounded-xl border border-input bg-background px-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={mercado?.ativo ?? true}
              className="size-4 rounded border-input"
            />
            Mercado ativo
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
              {mercado ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
