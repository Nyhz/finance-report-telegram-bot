import { getStatusWithSavedPrices } from "../utils"
import TelegramBot from "node-telegram-bot-api"

export function registerStatusCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/status/, (msg: any) => {
    if (msg.chat.id.toString() === chatId) {
      const summary = getStatusWithSavedPrices()
      bot.sendMessage(chatId, summary, { parse_mode: "HTML" })
    }
  })
}
