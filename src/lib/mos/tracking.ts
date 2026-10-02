/** Link di tracciamento pubblico del corriere, se noto. */
export function linkTracking(corriere: string, ldv: string): string | null {
  const c = corriere.trim().toLowerCase()
  const code = encodeURIComponent(ldv.trim())
  if (!code) return null
  if (c.startsWith("poste")) return `https://www.poste.it/cerca/index.html#/risultati-spedizioni/${code}`
  if (c === "sda") return `https://www.sda.it/wps/portal/Servizi_online/dettaglio-spedizione?locale=it&tracing.letteraVettura=${code}`
  if (c === "brt") return `https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspediz=${code}`
  if (c === "ups") return `https://www.ups.com/track?loc=it_IT&tracknum=${code}`
  if (c === "gls") return `https://gls-group.com/IT/it/servizi-online/ricerca-spedizioni/?match=${code}`
  if (c === "dhl") return `https://www.dhl.com/it-it/home/tracking.html?tracking-id=${code}`
  if (c === "fedex") return `https://www.fedex.com/fedextrack/?trknbr=${code}`
  return null
}
