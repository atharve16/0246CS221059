import React, { useState, useContext } from "react";
import { URLContext } from "../App";
import { useLogger } from "../hooks/LoggerContext";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
} from "@mui/material";

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

const styles = {
  formBox: {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #ccc",
  },
  errorText: { color: "#d32f2f", marginTop: 6 },
  successText: { color: "#2e7d32", marginTop: 6 },
};

function ShortenForm() {
  const { addShortUrl } = useContext(URLContext);
  const { log } = useLogger();

  const initialUrlItem = {
    originalUrl: "",
    validity: "",
    customCode: "",
    error: "",
    shortUrl: "",
    expiry: "",
  };

  const [urls, setUrls] = useState(Array(5).fill(null).map(() => ({ ...initialUrlItem })));

  const hostname = window.location.origin + "/";

  const handleChange = (index, field, value) => {
    setUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      newUrls[index] = { ...newUrls[index], [field]: value };
      if (field !== "error") {
        newUrls[index].error = "";
        newUrls[index].shortUrl = "";
        newUrls[index].expiry = "";
      }
      return newUrls;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newUrls = [...urls];

    for (let i = 0; i < newUrls.length; i++) {
      const entry = newUrls[i];
      if (!entry.originalUrl.trim()) continue;
      if (!isValidUrl(entry.originalUrl.trim())) {
        entry.error = "Invalid URL";
        valid = false;
        continue;
      }
      if (
        entry.validity &&
        (!/^\d+$/.test(entry.validity) || parseInt(entry.validity, 10) <= 0)
      ) {
        entry.error = "Validity must be a positive integer";
        valid = false;
        continue;
      }
      if (
        entry.customCode &&
        !/^[a-zA-Z0-9]{3,10}$/.test(entry.customCode.trim())
      ) {
        entry.error = "Custom shortcode must be 3-10 alphanumeric chars or empty";
        valid = false;
        continue;
      }
    }

    setUrls(newUrls);

    if (!valid) {
      await log({
        stack: "URLShortener",
        level: "warn",
        package: "ShortenForm",
        message: "Validation failed for one or more inputs",
      });
      return;
    }

    for (let i = 0; i < newUrls.length; i++) {
      const entry = newUrls[i];
      entry.error = "";
      entry.shortUrl = "";
      entry.expiry = "";

      try {
        if (entry.originalUrl.trim() === "") continue;
        const code = await addShortUrl({
          originalUrl: entry.originalUrl.trim(),
          validity: entry.validity ? entry.validity : 30,
          customCode: entry.customCode ? entry.customCode.trim() : undefined,
        });

        entry.shortUrl = hostname + code;
        const expiryTime = new Date(
          Date.now() +
            (entry.validity ? parseInt(entry.validity, 10) : 30) * 60000
        );
        entry.expiry = expiryTime.toLocaleString();

        await log({
          stack: "URLShortener",
          level: "info",
          package: "ShortenForm",
          message: `Shortened URL: ${entry.shortUrl} (original: ${entry.originalUrl})`,
        });
      } catch (err) {
        entry.error = err.message || "Failed to shorten URL";
        await log({
          stack: "URLShortener",
          level: "error",
          package: "ShortenForm",
          message: `Error shortening URL: ${entry.originalUrl} - ${entry.error}`,
        });
      }
    }
    setUrls([...newUrls]);
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <form onSubmit={handleSubmit}>
        {urls.map(({ originalUrl, validity, customCode, error, shortUrl, expiry }, idx) => (
          <Box key={idx} sx={styles.formBox}>
            <TextField
              label="Original URL"
              variant="outlined"
              value={originalUrl}
              onChange={(e) => handleChange(idx, "originalUrl", e.target.value)}
              fullWidth
              required={idx === 0}
              error={Boolean(error)}
              helperText={error && error.includes("URL") ? error : ""}
              margin="normal"
            />
            <TextField
              label="Validity Period (minutes) - default 30"
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: 1 }}
              value={validity}
              onChange={(e) => handleChange(idx, "validity", e.target.value)}
              error={Boolean(error)}
              helperText={error && error.includes("Validity") ? error : ""}
              sx={{ width: 200, marginRight: 2 }}
            />
            <TextField
              label="Custom Shortcode (3-10 alphanumeric)"
              variant="outlined"
              size="small"
              value={customCode}
              onChange={(e) => handleChange(idx, "customCode", e.target.value)}
              error={Boolean(error)}
              helperText={error && error.includes("shortcode") ? error : ""}
              sx={{ width: 250 }}
            />
            {shortUrl && (
              <Typography variant="body2" sx={styles.successText}>
                Short URL:{" "}
                <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                  {shortUrl}
                </a>
                <br />
                Expires at: {expiry}
              </Typography>
            )}
            {error && !error.includes("URL") && !error.includes("Validity") && !error.includes("shortcode") && (
              <Typography variant="body2" color="error">
                Error: {error}
              </Typography>
            )}
          </Box>
        ))}
        <Button variant="contained" type="submit" sx={{ marginTop: 2 }}>
          Shorten URLs
        </Button>
      </form>
      <Box marginTop={3}>
        <MuiLink href="/stats" underline="hover">
          View All Shortened URLs / Stats
        </MuiLink>
      </Box>
    </Container>
  );
}

export default ShortenForm;
