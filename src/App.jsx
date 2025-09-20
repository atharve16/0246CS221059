import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoggerProvider } from "./hooks/LoggerContext";
import ShortenForm from "./components/ShortenForm";
import StatsPage from "./components/StatsPage";
import RedirectHandler from "./components/RedirectHandler";
import { URLContext, URLProvider } from "./components/URLProvider";

function App() {
  return (
    <LoggerProvider>
      <URLProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ShortenForm />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/:shortcode" element={<RedirectHandler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </URLProvider>
    </LoggerProvider>
  );
}

export { URLContext };
export default App;
