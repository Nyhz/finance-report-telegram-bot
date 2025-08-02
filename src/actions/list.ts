import fs from "fs"
import path from "path"
import TelegramBot from "node-telegram-bot-api"

export function registerListCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/list/, async (msg: any) => {
    if (msg.chat.id.toString() !== chatId) return
    const assetsPath = path.resolve(process.cwd(), "src/assets.json")
    const data = fs.readFileSync(assetsPath, "utf-8")
    const assets = JSON.parse(data)
    let response = "<b>Lista de activos:</b>\n"
    for (const categoria in assets) {
      for (const asset of assets[categoria]) {
        response += `- ${asset.nombre} - <code>${asset.id}</code>\n`
      }
    }
    bot.sendMessage(chatId, response, { parse_mode: "HTML" })
  })
}
