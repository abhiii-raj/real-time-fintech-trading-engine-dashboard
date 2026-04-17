import React, { useState, useEffect } from "react";
// import { positions } from "../data/data";
import api from "../api";
import { fetchMarketQuotes, formatSignedPercent, toQuoteMap } from "../utils/marketQuotes";

const Positions = () => {
  const [allPositins, setAllPositions] = useState([]);
  const [quoteMap, setQuoteMap] = useState({});

  useEffect(() => {
    api.get("/myPositions").then((res) => {
      console.log(res.data);
      setAllPositions(res.data);
    }).catch((err) => {
      console.log(err);
      setAllPositions([]);
    });
  }, []);

  useEffect(() => {
    if (!allPositins.length) {
      return undefined;
    }

    let isMounted = true;
    const symbols = allPositins.map((stock) => stock.name);

    const loadQuotes = async () => {
      try {
        const quotes = await fetchMarketQuotes(symbols);
        if (isMounted) {
          setQuoteMap(toQuoteMap(quotes));
        }
      } catch (error) {
        console.log("Failed to fetch live position quotes", error);
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
  }, [allPositins]);

  return (
    <>
      <h3 className="title">Positions ({allPositins.length})</h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Product</th>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&L</th>
            <th>Chg.</th>
          </tr>

          {allPositins.map((stock, index) => {
            const quote = quoteMap[stock.name];
            const livePrice = Number.isFinite(quote?.lastPrice) ? quote.lastPrice : stock.price;
            const curValue = livePrice * stock.qty;
            const pnl = curValue - stock.avg * stock.qty;
            const isProfit = pnl >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = Number.isFinite(quote?.changePercent)
              ? (quote.changePercent < 0 ? "loss" : "profit")
              : (stock.isLoss ? "loss" : "profit");

            return (
              <tr key={index}>
                <td>{stock.product}</td>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{livePrice.toFixed(2)}</td>
                <td className={profClass}>{pnl.toFixed(2)}</td>
                <td className={dayClass}>{Number.isFinite(quote?.changePercent) ? formatSignedPercent(quote.changePercent) : stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
};

export default Positions;
