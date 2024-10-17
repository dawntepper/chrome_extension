import React from "react";
import ReactDOM from "react-dom";
import Popup from "./Popup";
import { AuthProvider } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";

console.log("Supabase client in popup:", supabase);
console.log("Supabase auth:", supabase.auth);

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

try {
  if ("createRoot" in ReactDOM) {
    const root = (ReactDOM as any).createRoot(container);
    root.render(renderApp());
  } else {
    ReactDOM.render(renderApp(), container);
  }
} catch (error) {
  console.error("Error rendering app:", error);
}
