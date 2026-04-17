// importing useState and useEffect to store the data and to sonnect to the api's respectively
import React, { useState, useEffect } from "react";
import api from "../api";
import { fetchMarketQuotes, formatSignedPercent, toQuoteMap } from "../utils/marketQuotes";

// import { holdings } from "../data/data";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [quoteMap, setQuoteMap] = useState({});

  useEffect(() => {
    api.get("/myHoldings").then((res) => {
      console.log(res.data) //just to see if the data is coming or not
      setAllHoldings(res.data);
    }).catch((err) => {
      console.log(err);
      setAllHoldings([]);
    });
  }, []);

  useEffect(() => {
    if (!allHoldings.length) {
      return undefined;
    }

    let isMounted = true;
    const symbols = allHoldings.map((stock) => stock.name);

    const loadQuotes = async () => {
      try {
        const quotes = await fetchMarketQuotes(symbols);
        if (isMounted) {
          setQuoteMap(toQuoteMap(quotes));
        }
      } catch (error) {
        console.log("Failed to fetch live holdings quotes", error);
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
  }, [allHoldings]);

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>

          {allHoldings.map((stock, index) => {
            const quote = quoteMap[stock.name];
            const livePrice = Number.isFinite(quote?.lastPrice) ? quote.lastPrice : stock.price;
            const curValue = livePrice * stock.qty;
            const pnl = curValue - stock.avg * stock.qty;
            const isProfit = pnl >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = Number.isFinite(quote?.changePercent)
              ? (quote.changePercent < 0 ? "loss" : "profit")
              : (stock.isLoss ? "loss" : "profit");
            const netPercent = stock.avg > 0 ? ((livePrice - stock.avg) / stock.avg) * 100 : 0;

            return (
              <tr key={index}>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{livePrice.toFixed(2)}</td>
                <td>{curValue.toFixed(2)}</td>
                <td className={profClass}>{pnl.toFixed(2)}</td>
                <td className={profClass}>{formatSignedPercent(netPercent)}</td>
                <td className={dayClass}>{Number.isFinite(quote?.changePercent) ? formatSignedPercent(quote.changePercent) : stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            29,875.<span>55</span>{" "}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            31,428.<span>95</span>{" "}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5>1,553.40 (+5.20%)</h5>
          <p>P&L</p>
        </div>
      </div>
      {/* <VerticalGraph data={data} /> */}
    </>
  );
};

export default Holdings;





// // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
// const labels = allHoldings.map((subArray) => subArray["name"]);

// const data = {
//   labels,
//   datasets: [
//     {
//       label: "Stock Price",
//       data: allHoldings.map((stock) => stock.price),
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//     },
//   ],
// };

// // export const data = {
// //   labels,
// //   datasets: [
// // {
// //   label: 'Dataset 1',
// //   data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
// //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
// // },
// //     {
// //       label: 'Dataset 2',
// //       data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
// //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
// //     },
// //   ],
// // };