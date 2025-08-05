# Finance Telegram Bot

A modular Telegram bot for tracking your personal assets and generating daily, weekly, and monthly financial reports. The bot fetches prices for your assets, keeps a history, and sends you clear summaries directly in Telegram.

## Features

- Add and manage assets by category (Fondos, ETFs, Criptomonedas, Acciones)
- Daily, weekly, and monthly reports with historical comparison
- Clear, readable summaries with emojis and percentage changes
- All logic is modular and easy to extend

## Commands

| Command | Description                              |
| ------- | ---------------------------------------- |
| /add    | Add a new asset to your portfolio        |
| /list   | List all your assets by category         |
| /status | Show the current value of your portfolio |
| /help   | Show help and usage instructions         |

> Reports are sent automatically via cron jobs (no manual command needed for weekly/monthly reports).

## Private Data

Sensitive files (assets, price history) are excluded from git by default.

---

Made with TypeScript, Node.js, and ❤️
