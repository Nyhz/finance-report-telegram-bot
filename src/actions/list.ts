import fs from "fs"
import path from "path"
import TelegramBot from "node-telegram-bot-api"

export function registerListCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/list/, async (msg: any) => {
    if (msg.chat.id.toString() !== chatId) return
    const assetsPath = path.resolve(process.cwd(), "src/assets.json")
    const data = fs.readFileSync(assetsPath, "utf-8")
    const assets = JSON.parse(data)
    let response = "<b>Lista de activos:</b>\n\n"
    for (const categoria in assets) {
      const lista = assets[categoria]
      if (!Array.isArray(lista) || lista.length === 0) continue
      response += `🗂 <b>${categoria.toUpperCase()}</b>\n`
      for (const asset of lista) {
        response += `- ${asset.nombre} - <code>${asset.id}</code>\n`
      }
      response += "\n"
    }
    bot.sendMessage(chatId, response.trim(), { parse_mode: "HTML" })
  })
}
