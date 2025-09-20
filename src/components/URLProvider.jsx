import React, { useState } from "react";
import { useLogger } from "../hooks/LoggerContext";

export const URLContext = React.createContext();

const generateShortCode = (length = 6) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const URLProvider = ({ children }) => {
  const [urlMap, setUrlMap] = useState({});
  const { log } = useLogger();

  const addShortUrl = async ({ originalUrl, validity, customCode }) => {
    await log({
      stack: "URLShortener",
      level: "info",
      package: "URLProvider",
      message: `Attempting to shorten URL: ${originalUrl} with code ${customCode || "auto"}`,
    });

    let code = customCode;
    if (code) {
      if (!/^[a-zA-Z0-9]{3,10}$/.test(code)) {
        await log({
          stack: "URLShortener",
          level: "warn",
          package: "URLProvider",
          message: `Invalid custom shortcode rejected: ${code}`,
        });
        throw new Error(
          "Custom shortcode invalid (only alphanumeric, 3-10 chars)"
        );
      }
      if (urlMap[code]) {
        await log({
          stack: "URLShortener",
          level: "warn",
          package: "URLProvider",
          message: `Custom shortcode already used: ${code}`,
        });
        throw new Error("Custom shortcode already exists");
      }
    } else {
      do {
        code = generateShortCode();
      } while (urlMap[code]);
    }

    const now = Date.now();
    const expiryMinutes = validity ? parseInt(validity, 10) : 30;
    const expiryTimestamp = now + expiryMinutes * 60 * 1000;

    const newMap = {
      ...urlMap,
      [code]: {
        originalUrl,
        expiryTimestamp,
        createdAt: now,
        shortcode: code,
      },
    };
    setUrlMap(newMap);

    await log({
      stack: "URLShortener",
      level: "info",
      package: "URLProvider",
      message: `Created short URL: ${code} -> ${originalUrl} expires in ${expiryMinutes} mins`,
    });

    return code;
  };

  return (
    <URLContext.Provider value={{ urlMap, addShortUrl }}>
      {children}
    </URLContext.Provider>
  );
};
