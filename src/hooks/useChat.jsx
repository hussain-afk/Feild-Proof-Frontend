import { useCallback, useEffect, useRef, useState } from "react";
import { getMessages, sendMessage } from "../api/chat.api.js";
import { socket } from "../services/socket.js";
import toast from "react-hot-toast";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

const useChat = (otherUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // object / naya reference se effect loop nahi hoga
  const otherId = getId(otherUserId);
  const abortRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!otherId) {
      setMessages([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.aborted = true;
    }
    const token = { aborted: false };
    abortRef.current = token;

    setLoading(true);
    try {
      const data = await getMessages(otherId);
      if (token.aborted) return;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      if (token.aborted) return;
      const status = error?.response?.status || error?.status;
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load chat";
      if (status === 429) {
        console.warn("Chat rate limited:", msg);
      } else {
        toast.error(typeof msg === "string" ? msg : "Failed to load chat");
      }
      setMessages([]);
    } finally {
      if (!token.aborted) setLoading(false);
    }
  }, [otherId]);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => {
      clearTimeout(initialLoad);
      if (abortRef.current) abortRef.current.aborted = true;
    };
  }, [loadMessages]);

  // Live messages
  useEffect(() => {
    if (!otherId || !socket) return;

    const onMessage = (msg) => {
      if (!msg) return;
      const s = getId(msg.sender);
      const r = getId(msg.receiver);
      // sirf is conversation ka
      if (s !== otherId && r !== otherId) return;

      setMessages((prev) => {
        if (prev.some((m) => getId(m._id) === getId(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    socket.on("chat:message", onMessage);
    return () => {
      socket.off("chat:message", onMessage);
    };
  }, [otherId]);

  const handleSendMessage = async (text, file = null) => {
    const clean = String(text || "").trim();

    // Text ya file, dono mein se kam az kam ek zaroori hai
    if ((!clean && !file) || !otherId) return;

    setSending(true);
    try {
      const msg = await sendMessage(otherId, clean, file);

      setMessages((prev) => {
        if (prev.some((m) => getId(m._id) === getId(msg._id))) return prev;
        return [...prev, msg];
      });
      return msg;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to send"
      );
      return null; // ChatPanel ko pata chale ke send fail hua
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    handleSendMessage,
    reload: loadMessages,
  };
};

export default useChat;