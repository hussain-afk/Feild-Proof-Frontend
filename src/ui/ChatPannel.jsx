import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Loader2, MessageCircle, Send } from "lucide-react";
import useChat from "../hooks/useChat.jsx";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const dayKey = (date) => (date ? new Date(date).toDateString() : "");

const dayLabel = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const GROUP_GAP_MS = 5 * 60 * 1000;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

function ChatPanel({ otherUserId, otherName, myUserId }) {
  const { messages, loading, sending, handleSendMessage } = useChat(otherUserId);
  const [text, setText] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Turn the flat message list into day separators + grouped bubbles
  const items = useMemo(() => {
    const result = [];
    const list = Array.isArray(messages) ? messages : [];

    list.forEach((msg, index) => {
      const prev = list[index - 1];
      const next = list[index + 1];
      const sender = getId(msg.sender);

      const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
      if (newDay && msg.createdAt) {
        result.push({
          type: "day",
          key: `day-${dayKey(msg.createdAt)}-${index}`,
          label: dayLabel(msg.createdAt),
        });
      }

      const sameAsPrev =
        !newDay &&
        prev &&
        getId(prev.sender) === sender &&
        new Date(msg.createdAt) - new Date(prev.createdAt) < GROUP_GAP_MS;

      const sameAsNext =
        next &&
        dayKey(next.createdAt) === dayKey(msg.createdAt) &&
        getId(next.sender) === sender &&
        new Date(next.createdAt) - new Date(msg.createdAt) < GROUP_GAP_MS;

      result.push({
        type: "message",
        key: msg._id || `msg-${index}`,
        msg,
        first: !sameAsPrev,
        last: !sameAsNext,
      });
    });

    return result;
  }, [messages]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const value = text;
    setText("");
    await handleSendMessage(value);
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  if (!otherUserId) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-[#0c1220] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/70">
          <MessageCircle className="h-6 w-6 text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">Select someone to start chatting</p>
      </div>
    );
  }

  if (!myUserId) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-[#0c1220] text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0c1220]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-300">
          {getInitials(otherName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {otherName || "Chat"}
          </p>
          <p className="truncate text-xs text-slate-500">
            Messages stay on this device session
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <div
          role="log"
          aria-live="polite"
          aria-label={`Conversation with ${otherName || "user"}`}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 py-4 [scrollbar-color:#1e293b_transparent] [scrollbar-width:thin]"
        >
          {loading ? (
            <div className="space-y-3 py-2" aria-label="Loading messages">
              {[
                "w-2/3 justify-start",
                "w-1/2 justify-end",
                "w-3/5 justify-start",
                "w-2/5 justify-end",
              ].map((cls, i) => (
                <div key={i} className={`flex ${cls.split(" ")[1]}`}>
                  <div
                    className={`h-10 animate-pulse rounded-2xl bg-slate-800/60 ${cls.split(" ")[0]}`}
                  />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/70">
                <MessageCircle className="h-6 w-6 text-slate-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-300">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Say hello to {otherName || "them"}.
              </p>
            </div>
          ) : (
            items.map((item) => {
              if (item.type === "day") {
                return (
                  <div
                    key={item.key}
                    className="my-4 flex items-center gap-3 text-[11px] text-slate-500"
                  >
                    <span className="h-px flex-1 bg-slate-800" />
                    {item.label}
                    <span className="h-px flex-1 bg-slate-800" />
                  </div>
                );
              }

              const { msg, first, last } = item;
              const mine = getId(msg.sender) === getId(myUserId);

              return (
                <div
                  key={item.key}
                  className={`flex w-full items-end gap-2 ${
                    mine ? "justify-end" : "justify-start"
                  } ${first ? "mt-3" : "mt-0.5"}`}
                >
                  {/* Their avatar sits at the end of each group */}
                  {!mine && (
                    <div className="w-7 shrink-0">
                      {last && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/15 text-[10px] font-semibold text-sky-300">
                          {msg.sender?.avatar ? (
                            <img
                              src={msg.sender.avatar}
                              alt={`${otherName || "User"} avatar`}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(otherName)
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] ${mine ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        mine
                          ? `bg-sky-600 text-white ${last ? "rounded-br-md" : ""}`
                          : `border border-slate-800 bg-[#0b1220] text-slate-200 ${last ? "rounded-bl-md" : ""}`
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    </div>
                    {last && msg.createdAt && (
                      <p className="mt-1 px-1 text-[10px] text-slate-500">
                        {formatTime(msg.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Jump to latest */}
        {!atBottom && !loading && items.length > 0 && (
          <button
            type="button"
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            aria-label="Jump to latest message"
            className={`absolute bottom-3 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-200 shadow-lg shadow-black/30 transition hover:bg-slate-700 ${focusRing}`}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-slate-800 p-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            aria-label="Type a message"
            maxLength={2000}
            className="h-11 w-full rounded-full border border-slate-800 bg-[#0b1220] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15"
          />
          {text.length > 1800 && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-slate-500">
              {text.length}/2000
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;