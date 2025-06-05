import { createRoot } from "react-dom/client";
import React from "react"; // Explicitly import React
import App from "./App.tsx";
import "./index.css";

// Make sure we have a root element
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Root element with id 'root' not found");
}
