import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import useChat from "../hooks/useChat.jsx";

const MAX_MEDIA_MB = 25;
const MAX_TEXT = 2000;
const GROUP_GAP_MS = 5 * 60 * 1000;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

const iconButton = `flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 ${focusRing}`;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const getId = (value) =>
  value && typeof value === "object"
    ? String(value._id || value.id || "")
    : String(value || "");

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const dayLabel = (date) => {
  const d = new Date(date);
  const days = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) /
      86400000
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const MEDIA_EXT = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "svg"],
  video: ["mp4", "webm", "mov", "m4v", "ogv", "mkv"],
  audio: ["mp3", "wav", "ogg", "m4a", "aac", "weba"],
};

// msg.mediaFile: URL string (ya { url } object). Koi media na ho to null.
const getMedia = (msg) => {
  const raw = Array.isArray(msg.mediaFile) ? msg.mediaFile[0] : msg.mediaFile;
  const url = raw && typeof raw === "object" ? raw.url || raw.secure_url : raw;
  if (!url) return null;

  const path = String(url).split("?")[0];
  const ext = path.split(".").pop().toLowerCase();

  const kind =
    Object.keys(MEDIA_EXT).find((k) => MEDIA_EXT[k].includes(ext)) ||
    (path.includes("/image/upload/")
      ? "image"
      : path.includes("/video/upload/")
        ? "video"
        : "file");

  return { url, kind, name: safeDecode(path.split("/").pop() || "Attachment") };
};

// Messages ko day dividers aur groups (first/last bubble) mein badal do
const sameGroup = (a, b) =>
  Boolean(a && b) &&
  getId(a.sender) === getId(b.sender) &&
  new Date(a.createdAt).toDateString() === new Date(b.createdAt).toDateString() &&
  Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_GAP_MS;

const buildItems = (messages) => {
  const list = Array.isArray(messages) ? messages : [];
  const items = [];

  list.forEach((msg, i) => {
    const prev = list[i - 1];
    const newDay =
      !prev ||
      new Date(prev.createdAt).toDateString() !==
        new Date(msg.createdAt).toDateString();

    if (newDay && msg.createdAt) {
      items.push({ type: "day", key: `day-${i}`, label: dayLabel(msg.createdAt) });
    }

    items.push({
      type: "message",
      key: msg._id || `msg-${i}`,
      msg,
      media: getMedia(msg),
      first: !sameGroup(prev, msg),
      last: !sameGroup(msg, list[i + 1]),
    });
  });

  return items;
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

function Avatar({ name, src, className = "h-7 w-7 text-[10px]" }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-500/15 font-semibold text-sky-300 ${className}`}
    >
      {src ? (
        <img src={src} alt={name || "User"} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function Placeholder({ children }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-[#0c1220] px-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function IconCircle({ children }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/70 text-slate-500">
      {children}
    </div>
  );
}

function Skeleton() {
  const rows = [
    ["w-2/3", "justify-start"],
    ["w-1/2", "justify-end"],
    ["w-3/5", "justify-start"],
    ["w-2/5", "justify-end"],
  ];
  return (
    <div className="space-y-3 py-2" aria-label="Loading messages">
      {rows.map(([width, side], i) => (
        <div key={i} className={`flex ${side}`}>
          <div className={`h-10 animate-pulse rounded-2xl bg-slate-800/60 ${width}`} />
        </div>
      ))}
    </div>
  );
}

function Media({ media, mine, onOpenImage }) {
  if (media.kind === "image") {
    return (
      <button
        type="button"
        onClick={() => onOpenImage(media)}
        aria-label={`Open image ${media.name}`}
        className={`block overflow-hidden rounded-xl ${focusRing}`}
      >
        <img
          src={media.url}
          alt={media.name}
          loading="lazy"
          className="max-h-72 w-full max-w-[280px] bg-black/20 object-cover transition hover:opacity-90"
        />
      </button>
    );
  }

  if (media.kind === "video") {
    return (
      <video
        controls
        preload="metadata"
        src={media.url}
        className="max-h-72 w-full max-w-[280px] rounded-xl bg-black"
      />
    );
  }

  if (media.kind === "audio") {
    return (
      <audio controls preload="metadata" src={media.url} className="h-10 w-60 max-w-full" />
    );
  }

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex w-60 max-w-full items-center gap-3 rounded-xl p-2.5 transition ${focusRing} ${
        mine ? "bg-white/10 hover:bg-white/15" : "bg-slate-800/60 hover:bg-slate-800"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          mine ? "bg-white/15 text-white" : "bg-sky-500/15 text-sky-300"
        }`}
      >
        <FileText className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{media.name}</span>
      <Download className="h-4 w-4 shrink-0 opacity-70" />
    </a>
  );
}

function Bubble({ item, myUserId, otherName, onOpenImage }) {
  const { msg, media, first, last } = item;
  const mine = getId(msg.sender) === getId(myUserId);

  return (
    <div
      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${
        first ? "mt-3" : "mt-0.5"
      }`}
    >
      {/* Samne wale ka avatar group ke aakhir mein */}
      {!mine && (
        <div className="w-7 shrink-0">
          {last && <Avatar name={otherName} src={msg.sender?.avatar} />}
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl text-sm leading-relaxed ${
            media ? "p-1.5" : "px-3.5 py-2"
          } ${
            mine
              ? `bg-sky-600 text-white ${last ? "rounded-br-md" : ""}`
              : `border border-slate-800 bg-[#0b1220] text-slate-200 ${last ? "rounded-bl-md" : ""}`
          }`}
        >
          {media && <Media media={media} mine={mine} onOpenImage={onOpenImage} />}

          {msg.text && (
            <p
              className={`whitespace-pre-wrap break-words ${
                media ? "px-2 pb-1 pt-2" : ""
              }`}
            >
              {msg.text}
            </p>
          )}
        </div>

        {last && msg.createdAt && (
          <p className="mt-1 px-1 text-[10px] text-slate-500">
            {formatTime(msg.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function Lightbox({ media, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${media.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div
        className="absolute right-4 top-4 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={media.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download image"
          className={iconButton}
        >
          <Download className="h-5 w-5" />
        </a>
        <button type="button" onClick={onClose} aria-label="Close preview" className={iconButton}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <img
        src={media.url}
        alt={media.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composer: text + ek file chunne aur bhejne wala hissa                */
/* ------------------------------------------------------------------ */

function AttachmentPreview({ file, onRemove }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!/^(image|video)\//.test(file.type)) return;
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0b1220] p-2">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800">
        {url && file.type.startsWith("image/") ? (
          <img src={url} alt={file.name} className="h-full w-full object-cover" />
        ) : url ? (
          <video src={url} muted className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <FileText className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
        <p className="text-xs text-slate-500">
          {(file.size / (1024 * 1024)).toFixed(1)} MB
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attached file"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white ${focusRing}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Composer({ onSend, sending }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const canSend = Boolean(text.trim()) || Boolean(file);

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // wohi file dobara chunni ho to bhi onChange chale
    if (!picked) return;

    if (picked.size > MAX_MEDIA_MB * 1024 * 1024) {
      setError(`File is too large. Choose a file under ${MAX_MEDIA_MB} MB.`);
      return;
    }
    setError("");
    setFile(picked); // nayi file purani ko replace karti hai
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canSend || sending) return;

    // Sirf kamyabi par clear karo, fail hone par text aur file wapas na jayein
    const sent = await onSend(text, file);
    if (sent) {
      setText("");
      setFile(null);
      setError("");
    }
  };

  return (
    <div className="border-t border-slate-800 p-3">
      {error && (
        <p role="alert" className="mb-2 px-1 text-xs text-rose-400">
          {error}
        </p>
      )}

      {file && (
        <div className="mb-2">
          <AttachmentPreview file={file} onRemove={() => setFile(null)} />
        </div>
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={pickFile}
          className="hidden"
          tabIndex={-1}
        />

        {/* Pill: attach button + input ek saath */}
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-slate-800 bg-[#0b1220] pl-1.5 pr-4 transition hover:border-slate-700 focus-within:border-sky-500/50 focus-within:ring-2 focus-within:ring-sky-500/15">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="Attach media"
            title={file ? "Replace attached file" : "Attach media"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-800 disabled:opacity-40 ${focusRing} ${
              file ? "text-sky-300" : "text-slate-400 hover:text-sky-300"
            }`}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            aria-label="Type a message"
            maxLength={MAX_TEXT}
            className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-600"
          />

          {text.length > MAX_TEXT - 200 && (
            <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
              {text.length}/{MAX_TEXT}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={sending || !canSend}
          aria-label="Send message"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat panel                                                           */
/* ------------------------------------------------------------------ */

function ChatPanel({ otherUserId, otherName, myUserId }) {
  const { messages, loading, sending, handleSendMessage } = useChat(otherUserId);
  const [atBottom, setAtBottom] = useState(true);
  const [preview, setPreview] = useState(null);
  const bottomRef = useRef(null);

  const items = useMemo(() => buildItems(messages), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  if (!otherUserId) {
    return (
      <Placeholder>
        <IconCircle>
          <MessageCircle className="h-6 w-6" />
        </IconCircle>
        Select someone to start chatting
      </Placeholder>
    );
  }

  if (!myUserId) {
    return (
      <Placeholder>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading chat...
      </Placeholder>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0c1220]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5">
        <Avatar name={otherName} className="h-10 w-10 text-sm" />
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
            <Skeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-14 text-center">
              <IconCircle>
                <MessageCircle className="h-6 w-6" />
              </IconCircle>
              <p className="mt-2 text-sm font-medium text-slate-300">No messages yet</p>
              <p className="text-xs text-slate-500">
                Say hello to {otherName || "them"}.
              </p>
            </div>
          ) : (
            items.map((item) =>
              item.type === "day" ? (
                <div
                  key={item.key}
                  className="my-4 flex items-center gap-3 text-[11px] text-slate-500"
                >
                  <span className="h-px flex-1 bg-slate-800" />
                  {item.label}
                  <span className="h-px flex-1 bg-slate-800" />
                </div>
              ) : (
                <Bubble
                  key={item.key}
                  item={item}
                  myUserId={myUserId}
                  otherName={otherName}
                  onOpenImage={setPreview}
                />
              )
            )
          )}
          <div ref={bottomRef} />
        </div>

        {!atBottom && !loading && items.length > 0 && (
          <button
            type="button"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            aria-label="Jump to latest message"
            className={`absolute bottom-3 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-200 shadow-lg shadow-black/30 transition hover:bg-slate-700 ${focusRing}`}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      <Composer onSend={handleSendMessage} sending={sending} />

      {preview && <Lightbox media={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

export default ChatPanel;