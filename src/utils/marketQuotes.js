import api from "../api";

export const formatSignedPercent = (value) => {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const fetchMarketQuotes = async (symbols = []) => {
  const uniqueSymbols = [...new Set((symbols || []).map((s) => String(s).trim().toUpperCase()).filter(Boolean))];
  const query = uniqueSymbols.length ? `?symbols=${encodeURIComponent(uniqueSymbols.join(","))}` : "";
  const response = await api.get(`/market/quotes${query}`);
  return response.data?.quotes || [];
};

export const toQuoteMap = (quotes = []) => {
  const map = {};
  quotes.forEach((quote) => {
    if (!quote?.symbol) {
      return;
    }
    map[String(quote.symbol).toUpperCase()] = quote;
  });
  return map;
};
