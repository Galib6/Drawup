import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./@base/config";
import App from "./App";
import { appToastOptions } from "./lib/appToast";
import { AppContextProvider } from "./provider/AppStates";
import { ModalProvider } from "./provider/ModalContext";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContextProvider>
        <ModalProvider>
          <App />
          <ToastContainer {...appToastOptions} limit={4} />
        </ModalProvider>
      </AppContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
