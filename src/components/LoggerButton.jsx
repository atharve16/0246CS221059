import React from "react";
import { useLogger } from "../hooks/LoggerContext";

function LoggerButton() {
  const { log } = useLogger();

  const handleClick = () => {
    log({
      stack: "Homepage",
      level: "info",
      package: "LoggerButton",
      message: "User clicked the log button",
    });
    alert("Log sent! (Check your backend)");
  };

  return (
    <button onClick={handleClick}>Send Log To API</button>
  );
}

export default LoggerButton;
