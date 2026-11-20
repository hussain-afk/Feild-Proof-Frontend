import Routing from "./router/Routing";
import { Toaster } from "react-hot-toast";
import { useContext, useEffect } from "react";
import { context } from "./context/context.jsx";
import LoadingState from "./ui/LoadingState.jsx";
import useOnlineStatus from "./hooks/useOnlineStatus.jsx";
import OfflinePage from "./ui/OfflinePage.jsx";
import { useLocation } from "react-router-dom";

import "leaflet/dist/leaflet.css";

function App() {
  const { isLoading, isRefreshing } = useContext(context);
  const isOnline = useOnlineStatus();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ["/", "/docs"];
    const isPublicPage = publicPaths.includes(window.location.pathname);
    const robots = document.querySelector('meta[name="robots"]');

    if (robots) {
      robots.setAttribute(
        "content",
        isPublicPage ? "index, follow" : "noindex, nofollow"
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        "href",
        isPublicPage
          ? window.location.origin + (window.location.pathname === "/docs" ? "/docs" : "/")
          : window.location.origin + "/"
      );
    }

    return () => undefined;
  }, [location.pathname]);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div>
      <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerStyle={{ top: 20 }}
  toastOptions={{
    duration: 3000,
    style: {
      background: "#111827",
      color: "#f1f5f9",
      border: "1px solid #1f2937",
      borderRadius: "12px",
      padding: "10px 14px",
      fontSize: "13px",
      fontWeight: "500",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
    },
    success: {
      iconTheme: {
        primary: "#38bdf8",
        secondary: "#111827",
      },
    },
    error: {
      duration: 4000,
      iconTheme: {
        primary: "#f87171",
        secondary: "#111827",
      },
    },
  }}
/>

      {/* Soft refresh — page rehni chahiye */}
      {isOnline && isRefreshing && !isLoading && (
        <div className="fixed left-0 right-0 top-0 z-[9998] h-0.5 overflow-hidden bg-slate-800">
          <div className="h-full w-1/3 animate-pulse bg-sky-500" />
        </div>
      )}

      {!isOnline ? (
        <OfflinePage onRetry={handleRetry} />
      ) : isLoading ? (
        <LoadingState />
      ) : (
        <Routing />
      )}
    </div>
  );
}

export default App;