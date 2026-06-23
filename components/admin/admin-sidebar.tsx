"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Tag,
  Store,
  Users,
  Settings,
  ShoppingCart,
  Images,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { sairAdmin } from "@/app/admin/actions"
import type { UsuarioRole } from "@/lib/supabase"

type Item = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  masterOnly?: boolean
}

const ITENS: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
  { href: "/admin/encartes", label: "Encartes", icon: Images },
  { href: "/admin/mercados", label: "Mercados", icon: Store, masterOnly: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, masterOnly: true },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export function AdminSidebar({
  nome,
  role,
}: {
  nome: string
  role: UsuarioRole
}) {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  const itens = ITENS.filter((i) => !i.masterOnly || role === "master")

  return (
    <>
      {/* Topo mobile */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingCart className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold">Painel Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Overlay mobile */}
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setAberto(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          aberto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingCart className="size-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">Carrinho Carioca</p>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAberto(false)}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            aria-label="Fechar menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {itens.map((item) => {
              const ativo =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setAberto(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      ativo
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                    aria-current={ativo ? "page" : undefined}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-xl bg-secondary px-3 py-2">
            <p className="truncate text-sm font-medium">{nome}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {role === "master" ? "Administrador master" : "Colaborador"}
            </p>
          </div>
          <form action={sairAdmin}>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-2",
              )}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
