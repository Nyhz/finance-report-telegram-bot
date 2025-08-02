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

export async function sendMonthlyReport(): Promise<string> {
  const assetsPath = path.resolve(process.cwd(), "src/assets.json")
  const monthlyCsvPath = path.join(__dirname, "monthly-prices.csv")
  const data = fs.readFileSync(assetsPath, "utf-8")
  const assets: AssetsByCategory = JSON.parse(data)

  let prevPrices: Record<string, number> = {}
  if (fs.existsSync(monthlyCsvPath)) {
    const csvContent = fs.readFileSync(monthlyCsvPath, "utf-8")
    const records = parse(csvContent, { columns: true })
    for (const row of records) {
      const r = row as any
      prevPrices[r.ticker] = parseFloat(r.precio)
    }
  }

  const hoy = new Date()
  const mes = hoy.toLocaleString("es-ES", { month: "long" })
  const anio = hoy.getFullYear()
  let newPrices: { ticker: string; precio: number }[] = []
  let totalGlobal = 0
  let totalPrevio = 0
  let message = `📅 <b>Reporte Mensual de tus Activos</b>\n<b>${
    mes.charAt(0).toUpperCase() + mes.slice(1)
  } ${anio}</b>\n\n`

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
  if (totalPrevio > 0) {
    variacionGlobal = ((totalGlobal - totalPrevio) / totalPrevio) * 100
  }
  const simboloGlobal = variacionGlobal >= 0 ? "↑" : "↓"
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
      const precioMesPasado = prevPrices[asset.ticker] ?? precioHoy
      const variacion = ((precioHoy - precioMesPasado) / precioMesPasado) * 100
      const simbolo = variacion >= 0 ? "↑" : "↓"
      const emoji = variacion >= 0 ? "📈" : "📉"
      message += `${emoji} <b>${asset.nombre}</b>\n`
      message += `Valor previo: <b>€${precioMesPasado.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `Valor actual: <b>€${precioHoy.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `Variación mensual: <b>${variacion.toFixed(
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
  fs.writeFileSync(monthlyCsvPath, csvString, "utf-8")

  return message
}
