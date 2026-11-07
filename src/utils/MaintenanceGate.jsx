import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { context } from "../context/context.jsx";
import { getMaintenanceStatus } from "../api/maintenance.api.js";
import { socket } from "../services/socket.js";
import MaintenancePage from "../ui/MaintenancePage.jsx";

const MIN_GAP = 30 * 1000; // kisi bhi do checks ke beech kam az kam itna gap
const POLL_TICK = 60 * 1000; // backup timer kitni der baad jaag kar sochega
const FALLBACK_EVERY = 5 * 60 * 1000; // socket disconnected ho to itne gap par check
const RATE_LIMIT_COOLDOWN = 60 * 1000; // 429 milne par 1 minute ruk jao

/* ------------------------------------------------------------------ */
/* Shared state (module level)                                          */
/* Gate remount ho ya do jagah laga ho, request phir bhi ek hi jati hai */
/* ------------------------------------------------------------------ */

let inFlight = null;
let lastCheckAt = 0;
let blockedUntil = 0;
let lastStatus = { active: false };

const fetchStatus = (force = false) => {
  // Pehle se request chal rahi hai: wohi promise wapas do
  if (inFlight) return inFlight;

  const now = Date.now();
  if (now < blockedUntil) return Promise.resolve(null);
  if (!force && now - lastCheckAt < MIN_GAP) return Promise.resolve(null);

  lastCheckAt = now;

  inFlight = getMaintenanceStatus()
    .then((data) => {
      if (data) lastStatus = data;
      return data;
    })
    .catch((error) => {
      const code = error?.response?.status ?? error?.status;
      if (code === 429) blockedUntil = Date.now() + RATE_LIMIT_COOLDOWN;
      // Server unavailable: last known status hi rakho.
      console.error("Maintenance status check failed:", error);
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

function MaintenanceGate({ children }) {
  const { user } = useContext(context);
  const { pathname } = useLocation();

  // Remount par bhi last known status se shuru karo (screen flash nahi hogi)
  const [status, setStatus] = useState(lastStatus);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const check = useCallback(async (force = false) => {
    const data = await fetchStatus(force);
    if (data) setStatus(data);
  }, []);

  useEffect(() => {
    // Initial status check.
    const initialCheck = setTimeout(() => {
      void check();
    }, 0);

    // Sirf backup: socket event aate hain, isliye har 30s polling ki zaroorat nahi.
    //  - tab chhupa hua ho: kuch nahi
    //  - socket connected aur maintenance off: kuch nahi (socket khud batayega)
    //  - socket disconnected: 5 minute mein ek baar
    //  - maintenance chal rahi ho: har minute (taake khatam hone ka pata chale)
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const active = statusRef.current.active;
      if (socket.connected && !active) return;
      if (!socket.connected && !active && Date.now() - lastCheckAt < FALLBACK_EVERY) {
        return;
      }

      void check();
    }, POLL_TICK);

    // Tab wapas visible ho to check (MIN_GAP ki wajah se spam nahi hoga)
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Existing Socket.IO connection se live update
    const handleMaintenanceUpdate = (data) => {
      if (data) {
        lastStatus = data;
        setStatus(data);
      }
    };

    // Reconnect par check (MIN_GAP aur in-flight dedupe lage hue hain)
    const handleConnect = () => {
      void check();
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
    // Button dabane par force check (sirf MIN_GAP skip hota hai)
    return <MaintenancePage status={status} onCheck={() => check(true)} />;
  }

  return children;
}

export default MaintenanceGate;