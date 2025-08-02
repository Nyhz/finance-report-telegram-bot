import TelegramBot from "node-telegram-bot-api"
import { sendWeeklyReport } from "../weeklyReport"

export function registerWeeklyCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/weekly/, async (msg: any) => {
    if (msg.chat.id.toString() !== chatId) return
    const report = await sendWeeklyReport()
    bot.sendMessage(chatId, report, { parse_mode: "HTML" })
  })
}
