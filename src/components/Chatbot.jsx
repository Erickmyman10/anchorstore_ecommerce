import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getBotReply, fmt } from "./chatbotLogic";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";
import "./chatbot.css";

const STORAGE_KEY = "anchorsoft_chat_history";

function buildWelcome(firstName) {
  const greeting = firstName ? `Hi ${firstName}! 👋` : "Hi there! 👋";
  return {
    role: "bot",
    text: `${greeting} I'm your shopping assistant. Ask me about products, orders, payments, or anything else.`,
    time: new Date().toISOString(),
  };
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadHistory(firstName) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [buildWelcome(firstName)];
  } catch {
    return [buildWelcome(firstName)];
  }
}

// ── Inline product card rendered inside a chat bubble ────────────
function ChatProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (added) return;
    onAddToCart(product);
    setAdded(true);
  };

  return (
    <div className="cb-product-card">
      {product.image ? (
        <img
          src={product.image}
          alt={product.title}
          className="cb-product-img"
          loading="lazy"
        />
      ) : (
        <div className="cb-product-img-placeholder">🛍️</div>
      )}
      <div className="cb-product-info">
        <p className="cb-product-name">{product.title}</p>
        <p className="cb-product-price">{fmt(product.price)}</p>
        <button
          className={`cb-add-btn ${added ? "added" : ""}`}
          onClick={handleClick}
        >
          {added ? "✓ Added to cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ── Main chatbot component ────────────────────────────────────────
export default function Chatbot() {
  const addToCart  = useCartStore((s) => s.addToCart);
  const cartCount  = useCartStore((s) =>
    s.cartItems.reduce((sum, i) => sum + i.quantity, 0)
  );
  const customer   = useAuthStore((s) => s.customer);
  const isAuth     = useAuthStore((s) => s.isAuthenticated);

  const firstName  = customer?.name?.trim().split(" ")[0] || "";

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(() => loadHistory(firstName));
  const [input,    setInput]    = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [toast,    setToast]    = useState(null); // { text, id }

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const toastTimer     = useRef(null);

  // Persist chat history
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Scroll + focus
  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isTyping) setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages, open, isTyping]);

  const showToast = useCallback((text) => {
    const id = Date.now();
    setToast({ text, id });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const appendBotMessage = useCallback((text, delay = 0) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text, time: new Date().toISOString() },
      ]);
    }, delay);
  }, []);

  const handleAddToCart = useCallback((product) => {
    addToCart(product);

    const name = product.title.split(" ").slice(0, 4).join(" ");

    // Personalised confirm + checkout nudge (staggered)
    appendBotMessage(
      `✅ ${name}… added to your cart!${firstName ? ` Great pick, ${firstName} 🎉` : " 🎉"}`,
      200
    );
    appendBotMessage(
      "Ready to checkout? 🛒 Head to your cart anytime to complete your purchase.",
      1600
    );

    showToast(`Added to cart 🛒`);
  }, [addToCart, appendBotMessage, showToast, firstName]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", text: input.trim(), time: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 🔌 future API hook — swap getBotReply() with your backend/AI call
    const { text, products } = await getBotReply(userMsg.text, firstName);

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { role: "bot", text, time: new Date().toISOString(), products: products ?? [] },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([buildWelcome(firstName)]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <div className="chatbot-container">

      {/* ── Toast notification ── */}
      {toast && (
        <div key={toast.id} className="cb-toast">
          <span>🛒</span>
          {toast.text}
          {isAuth && cartCount > 0 && (
            <Link to="/cart" className="cb-toast-link" onClick={() => setToast(null)}>
              View cart ({cartCount})
            </Link>
          )}
        </div>
      )}

      {open && (
        <div className="chatbot-box">

          {/* ── Header ── */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar-badge">🛍️</div>
              <div>
                <div className="chatbot-name">Store Assistant</div>
                <div className="chatbot-status-dot">
                  <span className="dot" />
                  {isTyping ? "Typing…" : "Online"}
                </div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              {/* Live cart count pill */}
              {cartCount > 0 && (
                <Link to="/cart" className="cb-cart-pill" title="View cart">
                  🛒 {cartCount}
                </Link>
              )}
              <button className="cb-icon-btn" onClick={clearChat} title="Clear chat">🗑</button>
              <button className="cb-icon-btn" onClick={() => setOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "bot" && <div className="msg-avatar">🤖</div>}
                <div className="msg-group">
                  <div className={`msg-bubble ${msg.role}`}>{msg.text}</div>

                  {/* Inline product cards */}
                  {msg.products?.length > 0 && (
                    <div className="cb-product-list">
                      {msg.products.map((p) => (
                        <ChatProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}

                  <div className="msg-time">{formatTime(msg.time)}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-row bot">
                <div className="msg-avatar">🤖</div>
                <div className="msg-group">
                  <div className="msg-bubble bot typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              disabled={isTyping}
            />
            <button
              className="cb-send-btn"
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        className={`chatbot-toggle ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat assistant"
      >
        {/* Cart badge on toggle button when chat is closed */}
        {!open && cartCount > 0 && (
          <span className="cb-toggle-badge">{cartCount > 9 ? "9+" : cartCount}</span>
        )}
        <span className="toggle-icon">
          {open ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
