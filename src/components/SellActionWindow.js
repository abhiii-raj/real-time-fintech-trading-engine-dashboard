import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { fetchMarketQuotes, formatSignedPercent } from "../utils/marketQuotes";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
    const [stockQuantity, setStockQuantity] = useState(1);
    const [stockPrice, setStockPrice] = useState(0.0);
    const [livePrice, setLivePrice] = useState(null);
    const [dayPercent, setDayPercent] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const generalContext = useContext(GeneralContext); // ✅ important

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

    const handleSellClick = async () => {
        try {
            setErrorMessage("");
            setSuccessMessage("");

            await api.post("/newOrder", {
                name: uid,
                qty: Number(stockQuantity),
                price: Number(stockPrice),
                mode: "SELL",
            });

            setSuccessMessage("Sell order placed successfully");

            setTimeout(() => {
                generalContext.closeSellWindow();
            }, 1000);

        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Sell failed"
            );
        }
    };

    const handleCancelClick = () => {
        generalContext.closeSellWindow(); // ✅ correct way
    };

    return (
        <div className="container" id="sell-window" draggable="true">
            <div className="regular-order">
                <div className="inputs">
                    <fieldset>
                        <legend>Qty.</legend>
                        <input
                            type="number"
                            onChange={(e) => setStockQuantity(Number(e.target.value))} // ✅ convert to number
                            value={stockQuantity}
                        />
                    </fieldset>

                    <fieldset>
                        <legend>Paper Price</legend>
                        <input
                            type="number"
                            step="0.05"
                            value={stockPrice}
                            readOnly
                        />
                    </fieldset>
                </div>
            </div>

            <div className="buttons">

                {errorMessage && (
                    <div className="error-box">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="success-box">
                        {successMessage}
                    </div>
                )}

                <span>
                    Live: {Number.isFinite(livePrice) ? `Rs ${livePrice.toFixed(2)}` : "--"}
                    {Number.isFinite(dayPercent) ? ` (${formatSignedPercent(dayPercent)})` : ""}
                    {" | "}Paper execute: Rs {Number(stockPrice || 0).toFixed(2)}
                </span>

                <div>
                    <Link className="btn btn-red" onClick={handleSellClick}>
                        Sell
                    </Link>

                    <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SellActionWindow;