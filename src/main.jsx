import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AppKitProvider } from "./Provider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppKitProvider>
      <App />
      <Toaster position="top-right" />
    </AppKitProvider>
  </StrictMode>
);
