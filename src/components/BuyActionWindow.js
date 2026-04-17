import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import { fetchMarketQuotes, formatSignedPercent } from "../utils/marketQuotes";

import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1); //default value is 1 
  const [stockPrice, setStockPrice] = useState(0.0);
  const [livePrice, setLivePrice] = useState(null);
  const [dayPercent, setDayPercent] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    let isMounted = true;

    const loadQuote = async () => {
      try {
        const quotes = await fetchMarketQuotes([uid]);
        const quote = quotes[0];

        if (!quote || !isMounted) {
          return;
        }

        if (Number.isFinite(quote.lastPrice)) {
          setLivePrice(quote.lastPrice);
        }

        if (Number.isFinite(quote.changePercent)) {
          setDayPercent(quote.changePercent);
        }

        if (Number.isFinite(quote.paperPrice)) {
          setStockPrice(quote.paperPrice);
        }
      } catch (error) {
        console.log("Unable to fetch live quote", error);
      }
    };

    loadQuote();

    const handleManualRefresh = () => {
      loadQuote();
    };

    window.addEventListener("market:refresh", handleManualRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("market:refresh", handleManualRefresh);
    };
  }, [uid]);

  const handleBuyClick = async () => {
    try {
      setIsPlacingOrder(true);
      setErrorMessage("");

      await api.post("/newOrder", {
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: "BUY",
      });

      generalContext.closeBuyWindow();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              // read the value from the user
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Paper Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              value={stockPrice}
              readOnly
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        {errorMessage && <span className="error-box">{errorMessage}</span>}
        <span>
          Live: {Number.isFinite(livePrice) ? `Rs ${livePrice.toFixed(2)}` : "--"}
          {Number.isFinite(dayPercent) ? ` (${formatSignedPercent(dayPercent)})` : ""}
          {" | "}Paper execute: Rs {Number(stockPrice || 0).toFixed(2)}
        </span>
        <div>
          <Link className="btn btn-blue" onClick={handleBuyClick}>
            {isPlacingOrder ? "Buying..." : "Buy"}
          </Link>
          <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
