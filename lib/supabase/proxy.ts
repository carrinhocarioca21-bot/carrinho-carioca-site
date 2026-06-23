import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // NAO execute codigo entre createServerClient e getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protege as rotas do painel administrativo (exceto a tela de login)
  const path = request.nextUrl.pathname
  if (path.startsWith("/admin") && !path.startsWith("/admin/login") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Pagina publica de envio de ofertas: apenas usuarios logados
  if (path.startsWith("/enviar") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("next", "/enviar")
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
