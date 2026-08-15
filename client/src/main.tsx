import { createRoot } from "react-dom/client";
import App from "./App";
import { AppShellControls } from "@/components/app-shell-controls";
import "./index.css";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}

createRoot(document.getElementById("root")!).render(
  <>
    <AppShellControls />
    <App />
  </>
);
createRoot(document.getElementById("root")!).render(<App />);
