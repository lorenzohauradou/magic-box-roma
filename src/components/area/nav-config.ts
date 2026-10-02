import { Archive, FilePlus2, FileSpreadsheet, LayoutDashboard, Users, type LucideIcon } from "lucide-react"
import type { Ruolo } from "@/types/database"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Corrispondenza esatta del path (per la dashboard) */
  exact?: boolean
  soloAdmin?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operatività",
    items: [
      { href: "/area-riservata", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/area-riservata/mos/nuovo", label: "Nuovo MOS", icon: FilePlus2, exact: true },
      { href: "/area-riservata/mos", label: "Archivio MOS", icon: Archive },
      { href: "/area-riservata/confronto", label: "Confronto Poste", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Amministrazione",
    items: [{ href: "/area-riservata/utenti", label: "Utenti", icon: Users, soloAdmin: true }],
  },
]

export function navPerRuolo(ruolo: Ruolo): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.soloAdmin || ruolo === "admin"),
  })).filter((g) => g.items.length > 0)
}

export function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  if (pathname === item.href) return true
  // "/area-riservata/mos" non deve risultare attivo su "/area-riservata/mos/nuovo"
  if (item.href === "/area-riservata/mos" && pathname === "/area-riservata/mos/nuovo") return false
  return pathname.startsWith(`${item.href}/`)
}
