import fs from "fs"
import path from "path"
import TelegramBot from "node-telegram-bot-api"

const handledMessages = new Set<number>()

export function registerAddCommands(bot: TelegramBot, chatId: string) {
  bot.onText(/\/add (\w+) (.+)/, async (msg: any, match: any) => {
    if (msg.chat.id.toString() !== chatId) return
    if (handledMessages.has(msg.message_id)) return
    handledMessages.add(msg.message_id)
    const idCategoria = match?.[1]?.toLowerCase()
    const input = match?.[2]
    if (!idCategoria || !input) {
      bot.sendMessage(
        chatId,
        "Formato incorrecto. Usa /help para ver las instrucciones."
      )
      return
    }
    const categoria = idCategoria
    const assetsPath = path.resolve(process.cwd(), "src/assets.json")
    const data = fs.readFileSync(assetsPath, "utf-8")
    const assets = JSON.parse(data)
    if (!assets[categoria]) {
      bot.sendMessage(
        chatId,
        "Identificador de categoría no válido. Usa /help para ver las instrucciones."
      )
      return
    }
    const [id, nombre, ticker, cantidadStr] = input
      .split(",")
      .map((s: string) => s.trim())
    const cantidad = parseFloat((cantidadStr || "").replace(",", "."))
    if (!id || !nombre || !ticker || isNaN(cantidad)) {
      bot.sendMessage(
        chatId,
        "Datos incompletos o incorrectos. Usa /help para ver las instrucciones."
      )
      return
    }

    const exists = assets[categoria].some((a: any) => a.id === id)
    if (exists) {
      bot.sendMessage(chatId, `Ya existe un activo con el id <b>${id}</b>.`, {
        parse_mode: "HTML",
      })
      return
    }

    const nuevoActivo = { id, nombre, ticker, cantidad }
    assets[categoria].push(nuevoActivo)
    fs.writeFileSync(assetsPath, JSON.stringify(assets, null, 2), "utf-8")
    bot.sendMessage(
      chatId,
      `✅ Activo añadido a <b>${categoria}</b>:\n<b>id:</b> <code>${id}</code>\n<b>nombre:</b> ${nombre}\n<b>ticker:</b> <code>${ticker}</code>\n<b>cantidad:</b> <b>${cantidad}</b>`,
      { parse_mode: "HTML" }
    )
  })
}
