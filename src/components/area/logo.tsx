import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AreaLogo({ className, dark = true }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/area-riservata" className={cn("flex items-center gap-3", className)}>
      <Image src="/logo-magic-box-roma.png" alt="Magic Box Roma" width={36} height={36} className="h-9 w-9 object-contain" priority />
      <span className="leading-tight">
        <span className={cn("block text-base font-bold", dark ? "text-white" : "text-secondary")}>
          Magic<span className="text-primary">Box</span> Roma
        </span>
        <span className={cn("block text-[10px] font-medium uppercase tracking-[0.2em]", dark ? "text-white/45" : "text-slate-400")}>
          Area riservata
        </span>
      </span>
    </Link>
  )
}
