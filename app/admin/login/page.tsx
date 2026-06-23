"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<"login" | "cadastro">("login")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setCarregando(true)
    const supabase = createClient()

    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        })
        if (error) throw error
        router.push("/admin")
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
            data: { nome },
          },
        })
        if (error) throw error
        if (data.session) {
          router.push("/admin")
          router.refresh()
        } else {
          setAviso(
            "Conta criada! Verifique seu email para confirmar e depois faça login.",
          )
          setModo("login")
        }
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao autenticar.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShoppingCart className="size-6" aria-hidden="true" />
          </span>
          <h1 className="mt-2 text-xl font-bold">Painel Carrinho Carioca</h1>
          <p className="text-sm text-muted-foreground">
            {modo === "login"
              ? "Entre para gerenciar as ofertas"
              : "Crie a conta de administrador"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {modo === "cadastro" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="Seu nome"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              placeholder="voce@email.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {erro}
            </p>
          )}
          {aviso && (
            <p className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
              {aviso}
            </p>
          )}

          <Button type="submit" size="lg" disabled={carregando} className="mt-1 h-11">
            {carregando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {modo === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo(modo === "login" ? "cadastro" : "login")
            setErro(null)
            setAviso(null)
          }}
          className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {modo === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  )
}
