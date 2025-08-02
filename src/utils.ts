import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { stringify } from "csv-stringify/sync"
import { fetchPrice } from "./priceFetcher"

interface Asset {
  nombre: string
  ticker: string
  cantidad: number
}

interface AssetsByCategory {
  [categoria: string]: Asset[]
}

export async function sendDailySummary(): Promise<string> {
  const assetsPath = path.resolve(process.cwd(), "src/assets.json")
  const csvPath = path.join(__dirname, "prices.csv")
  const data = fs.readFileSync(assetsPath, "utf-8")
  const assets: AssetsByCategory = JSON.parse(data)

  const hoy = new Date()
  const fechaStr = hoy.toLocaleDateString("es-ES")

  let prevPrices: Record<string, number> = {}
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const records = parse(csvContent, { columns: true })
    for (const row of records) {
      const r = row as any
      prevPrices[r.ticker] = parseFloat(r.precio)
    }
  }

  let newPrices: { ticker: string; precio: number }[] = []
  let totalGlobal = 0
  let message = `📊 <b>Resumen de tus Activos Financieros</b>\n<b>${fechaStr}</b>\n\n`

  for (const categoria in assets) {
    const lista = assets[categoria]
    if (!Array.isArray(lista) || lista.length === 0) continue
    for (const asset of lista) {
      const precioHoy = await fetchPrice(asset.ticker)
      const valorTotal = precioHoy * asset.cantidad
      totalGlobal += valorTotal
      newPrices.push({ ticker: asset.ticker, precio: precioHoy })
    }
  }

  message += `━━━━━━━━━━━━━━━━━━\n`
  message += `<b>➡️➡️  TOTAL: €${totalGlobal.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
  })}  ⬅️⬅️</b>\n`
  message += `━━━━━━━━━━━━━━━━━━\n\n`

  for (const categoria in assets) {
    const lista = assets[categoria]
    if (!Array.isArray(lista) || lista.length === 0) continue
    message += `🗂 <b>${categoria}</b>\n`
    message += `──────────────────\n`
    for (const asset of lista) {
      const precioHoy =
        newPrices.find((p) => p.ticker === asset.ticker)?.precio ?? 0
      const precioAyer = prevPrices[asset.ticker] ?? precioHoy
      const variacion = ((precioHoy - precioAyer) / precioAyer) * 100
      const simbolo = variacion >= 0 ? "↑" : "↓"
      const emoji = variacion >= 0 ? "📈" : "📉"
      const valorTotal = precioHoy * asset.cantidad
      message += `${emoji} <b>${asset.nombre}</b>\n`
      message += `• Valor actual: <b>€${precioHoy.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `• Participaciones: <b>${asset.cantidad}</b>\n`
      message += `• Valor total: <b>€${valorTotal.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `• Variación: <b>${variacion.toFixed(1)}% ${simbolo}</b>\n`
      message += `──────────────────\n`
    }
    message += "\n"
  }

  const csvString = stringify(newPrices, {
    header: true,
    columns: ["ticker", "precio"],
  })
  fs.writeFileSync(csvPath, csvString, "utf-8")

  return message
}

export function getStatusWithSavedPrices(): string {
  const assetsPath = path.resolve(process.cwd(), "src/assets.json")
  const csvPath = path.join(__dirname, "prices.csv")
  const data = fs.readFileSync(assetsPath, "utf-8")
  const assets: AssetsByCategory = JSON.parse(data)

  let prevPrices: Record<string, number> = {}
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, "utf-8")
    const records = parse(csvContent, { columns: true })
    for (const row of records) {
      const r = row as any
      prevPrices[r.ticker] = parseFloat(r.precio)
    }
  }

  const hoy = new Date()
  const fechaStr = hoy.toLocaleDateString("es-ES")
  let totalGlobal = 0

  for (const categoria in assets) {
    for (const asset of assets[categoria]) {
      const precioHoy = prevPrices[asset.ticker] ?? 0
      totalGlobal += precioHoy * asset.cantidad
    }
  }
  let message = `📊 <b>Resumen de tus Activos Financieros</b>\n<b>${fechaStr}</b>\n\n`
  message += `━━━━━━━━━━━━━━━━━━\n`
  message += `<b>➡️➡️  TOTAL: €${totalGlobal.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
  })}  ⬅️⬅️</b>\n`
  message += `━━━━━━━━━━━━━━━━━━\n\n`
  for (const categoria in assets) {
    const lista = assets[categoria]
    if (!Array.isArray(lista) || lista.length === 0) continue
    message += `🗂 <b>${categoria}</b>\n`
    message += `──────────────────\n`
    for (const asset of lista) {
      const precioHoy = prevPrices[asset.ticker] ?? 0
      const valorTotal = precioHoy * asset.cantidad
      message += `• <b>${asset.nombre}</b>\n`
      message += `  Valor actual: <b>€${precioHoy.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `  Participaciones: <b>${asset.cantidad}</b>\n`
      message += `  Valor total: <b>€${valorTotal.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}</b>\n`
      message += `──────────────────\n`
    }
    message += "\n"
  }
  return message
}
