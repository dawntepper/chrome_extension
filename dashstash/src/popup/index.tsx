import React from "react";
import ReactDOM from "react-dom";
import Popup from "./Popup";
import { AuthProvider } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Failed to find the root element");
}

const renderApp = () => (
  <React.StrictMode>
    <AuthProvider>
      <Popup />
    </AuthProvider>
  </React.StrictMode>
);

// Check if the createRoot API is available (React 18+)
if ("createRoot" in ReactDOM) {
  // TypeScript doesn't know about createRoot, so we need to use `any` here
  const root = (ReactDOM as any).createRoot(container);
  root.render(renderApp());
} else {
  // Fallback for React 17 and below
  ReactDOM.render(renderApp(), container);
}
