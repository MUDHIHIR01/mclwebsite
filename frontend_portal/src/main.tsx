import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "react-toastify/dist/ReactToastify.css"; // Add the toastify CSS
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ToastContainer } from "react-toastify"; // Import ToastContainer

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
          draggablePercent={0.6}
          hideProgressBar={true}
          closeButton={true}
        />
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>
);