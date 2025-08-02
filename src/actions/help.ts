import TelegramBot from "node-telegram-bot-api"

export function registerHelpCommand(bot: TelegramBot, chatId: string) {
  bot.onText(/\/help/, async (msg: any) => {
    if (msg.chat.id.toString() !== chatId) return
    const helpMsg = `<b>🤖 Finanzas Bot - Ayuda</b>

<b>Comandos disponibles:</b>

<code>/status</code>
Muestra el resumen diario de todos los activos, con precios y totales actualizados.

<code>/list</code>
Lista todos los activos registrados, agrupados por categoría, mostrando su nombre e id.

<code>/set id cantidad</code>
Actualiza la cantidad de participaciones de un activo existente.
Ejemplo: <code>/set fi-world 325,25</code>

<code>/add</code>
Muestra las instrucciones para añadir un nuevo activo a una categoría existente.

<code>/add idcategoria id,nombre,ticker,cantidad</code>
Añade un nuevo activo a una categoría existente.
Ejemplo: <code>/add etf etf-super,Super ETF,ASD123,950</code>

<b>Notas:</b>
- Solo puedes añadir activos a categorías ya existentes (no se crean nuevas categorías por este comando).
- Las categorías disponibles son:
  • <b>fi</b> (Fondos Indexados)
  • <b>etf</b> (ETF)
  • <b>crypto</b> (Cryptomonedas)
  • <b>stock</b> (Acciones)
- El resumen diario se puede consultar en cualquier momento con <code>/status</code>.
`
    bot.sendMessage(chatId, helpMsg, { parse_mode: "HTML" })
  })
}
