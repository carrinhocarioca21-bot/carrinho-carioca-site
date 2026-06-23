"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Loader2,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  X,
  Power,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  criarUsuario,
  definirAtivoUsuario,
  excluirUsuario,
} from "@/app/admin/actions"
import type { Usuario } from "@/lib/supabase"

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

export function UsuariosManager({
  usuarios,
  meuId,
}: {
  usuarios: Usuario[]
  meuId: string
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [pendingId, startTransition] = useTransition()
  const [acaoId, setAcaoId] = useState<string | null>(null)

  function toggleAtivo(u: Usuario) {
    setAcaoId(u.id)
    startTransition(async () => {
      const res = await definirAtivoUsuario(u.id, !u.ativo)
      if (!res.ok) alert(res.error)
      router.refresh()
      setAcaoId(null)
    })
  }

  function remover(u: Usuario) {
    if (!confirm(`Excluir o usuário ${u.email}? Esta ação não pode ser desfeita.`)) return
    setAcaoId(u.id)
    startTransition(async () => {
      const res = await excluirUsuario(u.id)
      if (!res.ok) alert(res.error)
      router.refresh()
      setAcaoId(null)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quem tem acesso ao painel administrativo.
          </p>
        </div>
        <Button onClick={() => setAberto(true)} className="gap-2">
          <Plus className="size-4" aria-hidden="true" />
          Novo Usuário
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {usuarios.map((u) => {
          const ocupado = pendingId && acaoId === u.id
          const souEu = u.id === meuId
          return (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    u.role === "master"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {u.role === "master" ? (
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  ) : (
                    <UserIcon className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div className="leading-tight">
                  <p className="font-medium">
                    {u.nome || u.email}{" "}
                    {souEu && (
                      <span className="text-xs text-muted-foreground">(você)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    u.role === "master"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {u.role === "master" ? "Master" : "Colaborador"}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    u.ativo
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {u.ativo ? "Ativo" : "Inativo"}
                </span>

                {!souEu && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleAtivo(u)}
                      disabled={!!ocupado}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label={u.ativo ? "Desativar" : "Ativar"}
                      title={u.ativo ? "Desativar" : "Ativar"}
                    >
                      {ocupado ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Power className="size-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(u)}
                      disabled={!!ocupado}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "text-destructive hover:bg-destructive/10",
                      )}
                      aria-label="Excluir"
                      title="Excluir"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {aberto && (
        <NovoUsuarioDialog
          onClose={() => setAberto(false)}
          onSaved={() => {
            setAberto(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function NovoUsuarioDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [state, formAction, pending] = useActionState(criarUsuario, { ok: false })

  useEffect(() => {
    if (state.ok) onSaved()
  }, [state.ok, onSaved])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Novo Usuário</h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome
            </label>
            <input id="nome" name="nome" type="text" className={inputClass} placeholder="Nome do colaborador" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="email@exemplo.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="text"
              required
              minLength={6}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
            <p className="text-xs text-muted-foreground">
              O colaborador pode trocar a senha depois. A conta já entra confirmada.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Nível de acesso
            </label>
            <select id="role" name="role" defaultValue="colaborador" className={inputClass}>
              <option value="colaborador">Colaborador (cadastra ofertas)</option>
              <option value="master">Master (acesso total)</option>
            </select>
          </div>

          {state.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="mt-1 flex gap-2">
            <Button type="button" variant="outline" size="lg" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={pending}
              className={cn(buttonVariants({ size: "lg" }), "flex-1 gap-2")}
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
