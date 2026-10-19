import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { COOKIE_OPTIONS } from "./env"

export const AREA_PATH = "/area-riservata"
export const LOGIN_PATH = `${AREA_PATH}/login`
export const LOGOUT_PATH = `${AREA_PATH}/logout`

/**
 * Rinfresca la sessione Supabase a ogni richiesta dell'area riservata e
 * protegge le pagine: senza sessione si finisce al login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    // Configurazione assente: lasciamo che la pagina mostri l'errore esplicito.
    return response
  }

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Con le chiavi JWT asimmetriche il token si verifica in locale: nessuna chiamata al server Auth.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { pathname } = request.nextUrl
  const isLogin = pathname === LOGIN_PATH
  const isLogout = pathname === LOGOUT_PATH

  if (!user && !isLogin) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = LOGIN_PATH
    redirectUrl.search = ""
    if (!isLogout && pathname !== AREA_PATH) {
      redirectUrl.searchParams.set("next", pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isLogin && !request.nextUrl.searchParams.has("errore")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = AREA_PATH
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

/** Accetta solo redirect interni all'area riservata (evita open redirect). */
export function sanitizeNext(next: string | null | undefined) {
  if (!next) return AREA_PATH
  if (!next.startsWith(`${AREA_PATH}/`) && next !== AREA_PATH) return AREA_PATH
  if (next.startsWith(LOGIN_PATH) || next.startsWith(LOGOUT_PATH)) return AREA_PATH
  return next
}
