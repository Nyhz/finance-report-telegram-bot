import TelegramBot from "node-telegram-bot-api"
import { sendMonthlyReport } from "../monthlyReport"

export function registerMonthlyCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/monthly/, async (msg: any) => {
    if (msg.chat.id.toString() !== chatId) return
    const report = await sendMonthlyReport()
    bot.sendMessage(chatId, report, { parse_mode: "HTML" })
  })
}
