import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { A11yProvider } from "./context/A11yProvider.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <A11yProvider>
        <App />
      </A11yProvider>
    </ThemeProvider>
  </StrictMode>
);
