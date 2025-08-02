import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { stringify } from "csv-stringify/sync"
import { fetchPrice } from "./priceFetcher"
import { CATEGORY_LABELS } from "./utils"

interface Asset {
  nombre: string
  ticker: string
  cantidad: number
}

interface AssetsByCategory {
  [categoria: string]: Asset[]
}

export async function sendWeeklyReport(): Promise<string> {
  const assetsPath = path.resolve(process.cwd(), "src/assets.json")
  const weeklyCsvPath = path.join(__dirname, "weekly-prices.csv")
  const data = fs.readFileSync(assetsPath, "utf-8")
  const assets: AssetsByCategory = JSON.parse(data)

  let prevPrices: Record<string, number> = {}
  let hasPrevPrices = false
  if (fs.existsSync(weeklyCsvPath)) {
    const csvContent = fs.readFileSync(weeklyCsvPath, "utf-8")
    const records = parse(csvContent, { columns: true })
    for (const row of records) {
      const r = row as any
      prevPrices[r.ticker] = parseFloat(r.precio)
    }
    if (Object.keys(prevPrices).length > 0) {
      hasPrevPrices = true
    }
  }

  const hoy = new Date()
  const fechaStr = hoy.toLocaleDateString("es-ES")
  // Calcular fecha de inicio de semana (lunes)
  const start = new Date(hoy)
  const day = hoy.getDay() || 7
  if (day !== 1) start.setDate(hoy.getDate() - day + 1)
  const startStr = start.toLocaleDateString("es-ES")
  let newPrices: { ticker: string; precio: number }[] = []
  let totalGlobal = 0
  let totalPrevio = 0
  let message = `📅 <b>Reporte Semanal de tus Activos</b>\n<b>Del ${startStr} al ${fechaStr}</b>\n\n`

  for (const categoria in assets) {
    const lista = assets[categoria]
    if (!Array.isArray(lista) || lista.length === 0) continue
    for (const asset of lista) {
      const precioHoy = await fetchPrice(asset.ticker)
      const valorTotal = precioHoy * asset.cantidad
      totalGlobal += valorTotal
      newPrices.push({ ticker: asset.ticker, precio: precioHoy })
      const precioPrevio = prevPrices[asset.ticker] ?? precioHoy
      totalPrevio += precioPrevio * asset.cantidad
    }
  }

  let variacionGlobal = 0
  let simboloGlobal = "→"
  if (hasPrevPrices && totalPrevio > 0) {
    variacionGlobal = ((totalGlobal - totalPrevio) / totalPrevio) * 100
    simboloGlobal = variacionGlobal >= 0 ? "↑" : "↓"
  }
  message += `━━━━━━━━━━━━━━━━━━\n`
  message += `<b>TOTAL: €${totalGlobal.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
  })} (${variacionGlobal.toFixed(2)}% ${simboloGlobal})</b>\n`
  message += `━━━━━━━━━━━━━━━━━━\n\n`

  for (const categoria in assets) {
    const lista = assets[categoria]
    if (!Array.isArray(lista) || lista.length === 0) continue
    const label = CATEGORY_LABELS[categoria] || categoria
    message += `🗂 <b>${label}</b>\n`
    message += `──────────────────\n`
    for (const asset of lista) {
      const precioHoy =
        newPrices.find((p) => p.ticker === asset.ticker)?.precio ?? 0
      let precioSemanaPasada = precioHoy
      let variacion = 0
      let simbolo = "→"
      let emoji = "➖"
      if (hasPrevPrices && prevPrices[asset.ticker] !== undefined) {
        precioSemanaPasada = prevPrices[asset.ticker]
        variacion =
          ((precioHoy - precioSemanaPasada) / precioSemanaPasada) * 100
        simbolo = variacion >= 0 ? "↑" : "↓"
        emoji = variacion >= 0 ? "📈" : "📉"
      }
      message += `${emoji} <b>${asset.nombre}</b>\n`
      message += `Valor previo: <b>€${precioSemanaPasada.toLocaleString(
        "es-ES",
        { minimumFractionDigits: 2 }
      )}</b>\n`
      message += `Valor actual: <b>€${precioHoy.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `Variación semanal: <b>${variacion.toFixed(
        1
      )}% ${simbolo}</b>\n`
      message += `──────────────────\n`
    }
    message += "\n"
  }

  const csvString = stringify(newPrices, {
    header: true,
    columns: ["ticker", "precio"],
  })
  fs.writeFileSync(weeklyCsvPath, csvString, "utf-8")

  return message
}
