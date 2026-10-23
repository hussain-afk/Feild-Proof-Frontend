import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { context } from "../context/context.jsx";
import { getMaintenanceStatus } from "../api/maintenance.api.js";
import { socket } from "../services/socket.js";
import MaintenancePage from "../ui/MaintenancePage.jsx";

const CHECK_EVERY = 30 * 1000;

function MaintenanceGate({ children }) {
  const { user } = useContext(context);
  const { pathname } = useLocation();

  const [status, setStatus] = useState({ active: false });

  const check = useCallback(async () => {
    try {
      const data = await getMaintenanceStatus();

      if (data) {
        setStatus(data);
      }
    } catch (error) {
      // Server unavailable: keep the last known status.
      console.error("Maintenance status check failed:", error);
    }
  }, []);

  useEffect(() => {
    // Initial status check.
    const initialCheck = setTimeout(() => {
      void check();
    }, 0);

    // Fallback check every 30 seconds.
    const timer = setInterval(check, CHECK_EVERY);

    // Check again when the browser tab becomes visible.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    // Listen to the existing Socket.IO connection.
    const handleMaintenanceUpdate = (data) => {
      if (data) {
        setStatus(data);
      }
    };

    const handleConnect = () => {
      // Recheck in case maintenance changed while disconnected.
      check();
    };

    socket.on("maintenance:updated", handleMaintenanceUpdate);
    socket.on("connect", handleConnect);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);

      socket.off("maintenance:updated", handleMaintenanceUpdate);
      socket.off("connect", handleConnect);
    };
  }, [check]);

  const isAdmin = user?.role === "admin";
  const isAuthRoute = pathname.startsWith("/auth");

  if (status.active && !isAdmin && !isAuthRoute) {
    return <MaintenancePage status={status} onCheck={check} />;
  }

  return children;
}

export default MaintenanceGate;