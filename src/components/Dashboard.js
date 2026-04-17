import React from "react";
import { Route, Routes } from "react-router-dom";

import Apps from "./Apps";
import Funds from "./Funds";
import Holdings from "./Holdings";

import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import TradeChatbot from "./TradeChatbot";
import { GeneralContextProvider } from "./GeneralContext";

const Dashboard = () => {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <GeneralContextProvider>
          <aside className="dashboard-watchlist-pane">
            <WatchList />
          </aside>
        </GeneralContextProvider>

        <main className="content dashboard-content-pane">
          <Routes>
            <Route index element={<Summary />} />
            <Route path="orders" element={<Orders />} />
            <Route path="holdings" element={<Holdings />} />
            <Route path="positions" element={<Positions />} />
            <Route path="funds" element={<Funds />} />
            <Route path="apps" element={<Apps />} />
            <Route path="*" element={<Summary />} />
          </Routes>
        </main>

        <TradeChatbot />
      </div>
    </div>
  );
};

export default Dashboard;
