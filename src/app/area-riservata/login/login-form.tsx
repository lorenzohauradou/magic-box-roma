"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accedi, type LoginState } from "./actions"

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(accedi, { errore: null })
  const [mostraPassword, setMostraPassword] = useState(false)

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@magicboxroma.it"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={mostraPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setMostraPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
            aria-label={mostraPassword ? "Nascondi password" : "Mostra password"}
          >
            {mostraPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state.errore ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.errore}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-11 w-full bg-primary text-white hover:bg-primary-600" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {pending ? "Accesso in corso…" : "Accedi"}
      </Button>
    </form>
  )
}
