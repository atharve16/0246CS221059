import React, { useContext, useEffect } from "react";
import { URLContext } from "../App";
import { useLogger } from "../hooks/LoggerContext";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Link,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function StatsPage() {
  const { urlMap } = useContext(URLContext);
  const { log } = useLogger();

  useEffect(() => {
    log({
      stack: "URLShortener",
      level: "info",
      package: "StatsPage",
      message: "Viewed URL statistics page",
    });
  }, [log]);

  const hostname = window.location.origin + "/";

  const isExpired = (expiryTimestamp) => Date.now() > expiryTimestamp;

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener Stats
      </Typography>
      {Object.entries(urlMap).length === 0 && (
        <Typography>No URLs shortened yet.</Typography>
      )}
      {Object.entries(urlMap).length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shortcode</TableCell>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Expires At</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(urlMap).map(([code, data]) => (
                <TableRow key={code}>
                  <TableCell>{code}</TableCell>
                  <TableCell>
                    <Link
                      href={`${hostname}${code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hostname}
                      {code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={data.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data.originalUrl}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(data.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(data.expiryTimestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {isExpired(data.expiryTimestamp) ? "Expired" : "Active"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box marginTop={3}>
        <Link component={RouterLink} to="/" underline="hover">
          Back to Shortener
        </Link>
      </Box>
    </Container>
  );
}

export default StatsPage;
