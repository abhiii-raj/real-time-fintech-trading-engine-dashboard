import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { watchlist } from "../data/data";
import { fetchMarketQuotes } from "../utils/marketQuotes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TRACKED_SYMBOLS = watchlist.slice(0, 8).map((stock) => stock.name);
const MAX_POINTS = 24;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Live Market Snapshot",
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "Price (INR)",
      },
      ticks: {
        precision: 0,
      },
    },
  },
};

const MarketGraph = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(TRACKED_SYMBOLS[0] || "");
  const [historyBySymbol, setHistoryBySymbol] = useState({});
  const [currentQuoteBySymbol, setCurrentQuoteBySymbol] = useState({});
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadQuotes = async () => {
      try {
        const quotes = await fetchMarketQuotes(TRACKED_SYMBOLS);
        if (!isMounted) {
          return;
        }

        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        setCurrentQuoteBySymbol((prev) => {
          const next = { ...prev };
          quotes.forEach((quote) => {
            if (quote?.symbol) {
              next[quote.symbol] = quote;
            }
          });
          return next;
        });

        setHistoryBySymbol((prev) => {
          const next = { ...prev };

          TRACKED_SYMBOLS.forEach((symbol) => {
            const quote = quotes.find((item) => item?.symbol === symbol);
            const lastPrice = Number(quote?.lastPrice);
            if (!Number.isFinite(lastPrice)) {
              return;
            }

            const existing = next[symbol] || [];
            const updated = [...existing, { t: timeLabel, p: lastPrice }];
            next[symbol] = updated.slice(-MAX_POINTS);
          });

          return next;
        });
        setLastUpdatedAt(new Date().toLocaleTimeString());
      } catch (error) {
        console.log("Unable to load graph quotes", error);
      }
    };

    loadQuotes();

    const handleManualRefresh = () => {
      loadQuotes();
    };

    window.addEventListener("market:refresh", handleManualRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("market:refresh", handleManualRefresh);
    };
  }, []);

  const graphData = useMemo(() => {
    const selectedHistory = historyBySymbol[selectedSymbol] || [];
    const labels = selectedHistory.map((point) => point.t);
    const prices = selectedHistory.map((point) => point.p);

    return {
      labels,
      datasets: [
        {
          label: `${selectedSymbol} Price`,
          data: prices,
          borderColor: "rgba(37, 99, 235, 1)",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          pointBackgroundColor: "rgba(37, 99, 235, 1)",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          tension: 0.28,
          fill: true,
        },
      ],
    };
  }, [historyBySymbol, selectedSymbol]);

  const selectedQuote = currentQuoteBySymbol[selectedSymbol] || null;
  const currentPrice = Number(selectedQuote?.lastPrice);
  const currentChange = Number(selectedQuote?.changePercent);

  return (
    <section className="market-graph-card">
      <div className="market-graph-header">
        <h4>Market Time-Series Graph</h4>
        <span>{lastUpdatedAt ? `Updated at ${lastUpdatedAt}` : "Loading..."}</span>
      </div>

      <div className="market-graph-toolbar">
        <label htmlFor="market-symbol-select">Symbol</label>
        <select
          id="market-symbol-select"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
        >
          {TRACKED_SYMBOLS.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
        <div className="market-graph-kpis">
          <span>
            Price: {Number.isFinite(currentPrice) ? `Rs ${currentPrice.toFixed(2)}` : "--"}
          </span>
          <span className={Number.isFinite(currentChange) ? (currentChange >= 0 ? "profit" : "loss") : ""}>
            Chg: {Number.isFinite(currentChange) ? `${currentChange.toFixed(2)}%` : "--"}
          </span>
        </div>
      </div>

      <div className="market-graph-body">
        <Line options={chartOptions} data={graphData} />
      </div>
    </section>
  );
};

export default MarketGraph;
