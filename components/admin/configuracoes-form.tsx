"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"

export function ConfiguracoesForm() {
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (senha.length < 6) {
      setMsg({ tipo: "erro", texto: "A senha deve ter ao menos 6 caracteres." })
      return
    }
    if (senha !== confirma) {
      setMsg({ tipo: "erro", texto: "As senhas não conferem." })
      return
    }

    setCarregando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    setCarregando(false)

    if (error) {
      setMsg({ tipo: "erro", texto: error.message })
    } else {
      setMsg({ tipo: "ok", texto: "Senha alterada com sucesso." })
      setSenha("")
      setConfirma("")
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-muted-foreground">Alterar senha</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nova-senha" className="text-sm font-medium">
            Nova senha
          </label>
          <input
            id="nova-senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirma-senha" className="text-sm font-medium">
            Confirmar senha
          </label>
          <input
            id="confirma-senha"
            type="password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            minLength={6}
            required
            className={inputClass}
            placeholder="Repita a senha"
          />
        </div>

        {msg && (
          <p
            className={
              msg.tipo === "ok"
                ? "rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            }
          >
            {msg.texto}
          </p>
        )}

        <Button type="submit" disabled={carregando} className="gap-2 self-start">
          {carregando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Salvar nova senha
        </Button>
      </form>
    </section>
  )
}
