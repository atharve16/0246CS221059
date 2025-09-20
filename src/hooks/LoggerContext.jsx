import React, { createContext, useContext } from "react";

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";

const LoggerContext = createContext();

export const LoggerProvider = ({ children }) => {
  const log = async ({ stack, level, package: pkg, message }) => {
    try {
      await fetch(LOG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack, level, package: pkg, message }),
      });
    } catch (error) {
      console.error("Logging API failed:", error);
    }
  };

  return <LoggerContext.Provider value={{ log }}>{children}</LoggerContext.Provider>;
};

export const useLogger = () => useContext(LoggerContext);
