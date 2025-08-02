import "./env"
import express from "express"
import "./bot"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Finance Telegram Bot is running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
