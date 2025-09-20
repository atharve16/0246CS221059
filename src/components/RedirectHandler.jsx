import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URLContext } from "../App";
import { useLogger } from "../hooks/LoggerContext";

const RedirectHandler = () => {
  const { urlMap } = useContext(URLContext);
  const navigate = useNavigate();
  const { log } = useLogger();
  const { shortcode } = useParams();

  useEffect(() => {
    log({
      stack: "URLShortener",
      level: "info",
      package: "RedirectHandler",
      message: `Redirect attempt for shortcode: ${shortcode}`,
    });

    const urlEntry = urlMap[shortcode];

    if (urlEntry) {
      const now = Date.now();
      if (now > urlEntry.expiryTimestamp) {
        log({
          stack: "URLShortener",
          level: "warn",
          package: "RedirectHandler",
          message: `Shortcode expired: ${shortcode}`,
        });
        alert("This short URL has expired.");
        navigate("/");
      } else {
        log({
          stack: "URLShortener",
          level: "info",
          package: "RedirectHandler",
          message: `Redirecting shortcode ${shortcode} to ${urlEntry.originalUrl}`,
        });
        window.location.href = urlEntry.originalUrl;
      }
    } else {
      log({
        stack: "URLShortener",
        level: "warn",
        package: "RedirectHandler",
        message: `Unknown shortcode: ${shortcode}`,
      });
      alert("Unknown short URL.");
      navigate("/");
    }
  }, [shortcode, urlMap, navigate, log]);

  return null;
};

export default RedirectHandler;
