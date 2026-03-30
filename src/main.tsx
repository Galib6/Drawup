// Load global CSS first so @font-face exists before modules that call document.fonts.* run.
import "./styles/index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { queryClient } from "./@base/config";
import App from "./App";
import { NotificationHost } from "./components/notifications/NotificationHost";
import { CloudSyncProvider } from "./provider/CloudSyncContext";
import { AppContextProvider } from "./provider/AppStates";
import { ModalProvider } from "./provider/ModalContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContextProvider>
        <ModalProvider>
          <CloudSyncProvider>
            <App />
            <NotificationHost />
          </CloudSyncProvider>
        </ModalProvider>
      </AppContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
