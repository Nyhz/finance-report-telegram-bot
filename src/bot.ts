import "./env"
import TelegramBot from "node-telegram-bot-api"
import "./scheduler"
import { registerStatusCommand } from "./actions/status"
import { registerAddCommands } from "./actions/add"
import { registerHelpCommand } from "./actions/help"
import { registerListCommand } from "./actions/list"

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN"
const CHAT_ID = process.env.CHAT_ID || "YOUR_CHAT_ID"

export const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

registerStatusCommand(bot, CHAT_ID)
registerAddCommands(bot, CHAT_ID)
registerHelpCommand(bot, CHAT_ID)
registerListCommand(bot, CHAT_ID)
