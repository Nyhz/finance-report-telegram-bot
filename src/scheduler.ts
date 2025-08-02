import "./env"
import cron from "node-cron"
import { sendDailySummary } from "./utils"
import { bot } from "./bot"

const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID"

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
