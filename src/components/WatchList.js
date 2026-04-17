import React, { useState, useContext, useEffect, useMemo } from "react";

import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";

import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";
import { fetchMarketQuotes, formatSignedPercent, toQuoteMap } from "../utils/marketQuotes";

const WatchList = () => {
  const [quoteMap, setQuoteMap] = useState({});

  const displayWatchlist = useMemo(() => {
    return watchlist.map((stock) => {
      const liveQuote = quoteMap[stock.name];
      if (!liveQuote || !Number.isFinite(liveQuote.lastPrice)) {
        return stock;
      }

      const liveChangePercent = Number(liveQuote.changePercent);

      return {
        ...stock,
        price: liveQuote.lastPrice,
        percent: formatSignedPercent(liveChangePercent),
        isDown: Number.isFinite(liveChangePercent) ? liveChangePercent < 0 : stock.isDown,
      };
    });
  }, [quoteMap]);

  useEffect(() => {
    let isMounted = true;

    const loadQuotes = async () => {
      try {
        const symbols = watchlist.map((stock) => stock.name);
        const quotes = await fetchMarketQuotes(symbols);
        if (isMounted) {
          setQuoteMap(toQuoteMap(quotes));
        }
      } catch (error) {
        console.log("Market quote fetch failed", error);
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

  const data = {
    labels: displayWatchlist.map((stock) => stock.name),
    datasets: [
      {
        label: "Price",
        data: displayWatchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // export const data = {
  //   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  // datasets: [
  //   {
  //     label: "# of Votes",
  //     data: [12, 19, 3, 5, 2, 3],
  //     backgroundColor: [
  //       "rgba(255, 99, 132, 0.2)",
  //       "rgba(54, 162, 235, 0.2)",
  //       "rgba(255, 206, 86, 0.2)",
  //       "rgba(75, 192, 192, 0.2)",
  //       "rgba(153, 102, 255, 0.2)",
  //       "rgba(255, 159, 64, 0.2)",
  //     ],
  //     borderColor: [
  //       "rgba(255, 99, 132, 1)",
  //       "rgba(54, 162, 235, 1)",
  //       "rgba(255, 206, 86, 1)",
  //       "rgba(75, 192, 192, 1)",
  //       "rgba(153, 102, 255, 1)",
  //       "rgba(255, 159, 64, 1)",
  //     ],
  //     borderWidth: 1,
  //   },
  // ],
  // };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {displayWatchlist.length} / 50</span>
      </div>

      <ul className="list">
        {displayWatchlist.map((stock, index) => {
          return <WatchListItem stock={stock} key={index} />;
        })}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (event) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (event) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* for every item */}
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span> {/* percent ke liye */}
          {stock.isDown ? (<KeyboardArrowDown className="down" />) : (<KeyboardArrowUp className="down" />)} {/* arrow ke liye */}
          <span className="price">{stock.price}</span> {/* paisa ke liye */}
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">B</button>
        </Tooltip>
        <Tooltip
          title="Sell"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">S</button>
        </Tooltip>
        <Tooltip
          title="Analytics"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
