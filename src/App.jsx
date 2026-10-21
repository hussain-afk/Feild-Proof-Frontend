
import Routing from "./router/Routing";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { context } from "./context/context.jsx";
import LoadingState from "./ui/LoadingState.jsx";
import useOnlineStatus from "./hooks/useOnlineStatus.jsx";
import OfflinePage from "./ui/OfflinePage.jsx";

import "leaflet/dist/leaflet.css";

function App() {
  const { isLoading } = useContext(context);
  const isOnline = useOnlineStatus();

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#111827",
            color: "#f3f4f6",
            border: "1px solid #1f2937",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            fontSize: "13px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#111827",
            },
            style: {
              borderLeft: "4px solid #3b82f6",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#111827",
            },
            style: {
              borderLeft: "4px solid #ef4444",
            },
          },
        }}
      />

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
