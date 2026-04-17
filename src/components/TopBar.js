import React from "react";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import Menu from "./Menu";

const TopBar = () => {
  const handleMarketRefresh = () => {
    window.dispatchEvent(new Event("market:refresh"));
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="index-card index-up">
          <p className="index">NIFTY 50</p>
          <p className="index-points">22,964.30</p>
          <p className="percent">+0.42%</p>
        </div>
        <div className="index-card index-down">
          <p className="index">SENSEX</p>
          <p className="index-points">75,178.14</p>
          <p className="percent">-0.18%</p>
        </div>
        <button className="market-refresh-btn" onClick={handleMarketRefresh}>
          <RefreshOutlinedIcon fontSize="inherit" />
          Refresh Market Data
        </button>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
