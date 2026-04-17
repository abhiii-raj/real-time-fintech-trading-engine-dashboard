import React, { useEffect, useState } from "react";

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import DashboardLogin from "./DashboardLogin";
import api from "../api";

const Home = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateAuth = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    try {
      await api.get("/me");
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    validateAuth();
  }, []);

  if (isCheckingAuth) {
    return <div className="dash-auth-loading">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <DashboardLogin onLoginSuccess={validateAuth} />;
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
