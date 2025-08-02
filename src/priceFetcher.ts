import yahooFinance from "yahoo-finance2"
yahooFinance.suppressNotices(["yahooSurvey"])

export async function fetchPrice(ticker: string): Promise<number> {
  try {
    const quote = await yahooFinance.quote(ticker)
    if (quote && typeof quote.regularMarketPrice === "number") {
      return quote.regularMarketPrice
    }
    throw new Error("No se pudo obtener el precio")
  } catch (err) {
    console.error(`Error obteniendo precio para ${ticker}:`, err)
    return NaN
  }
}
