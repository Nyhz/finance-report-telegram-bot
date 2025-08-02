import "./env"
import cron from "node-cron"
import { sendDailySummary } from "./utils"
import { sendWeeklyReport } from "./weeklyReport"
import { sendMonthlyReport } from "./monthlyReport"
import { bot } from "./bot"

const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID"

cron.schedule(
  "0 10 1 * *",
  async () => {
    const monthly = await sendMonthlyReport()
    bot.sendMessage(CHAT_ID, monthly, { parse_mode: "HTML" })
  },
  {
    timezone: "Europe/Madrid",
  }
)

cron.schedule(
  "0 10 * * 1",
  async () => {
    const weekly = await sendWeeklyReport()
    bot.sendMessage(CHAT_ID, weekly, { parse_mode: "HTML" })
  },
  {
    timezone: "Europe/Madrid",
  }
)

cron.schedule(
  "0 10 * * *",
  async () => {
    const summary = await sendDailySummary()
    bot.sendMessage(CHAT_ID, summary, { parse_mode: "HTML" })
  },
  {
    timezone: "Europe/Madrid",
  }
)
