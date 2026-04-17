import React, { useState } from "react";
import api from "../api";

const initialBotMessage = {
  role: "bot",
  text: "Hi, I am NiveshBot . Ask me anything about trades, holdings, positions, or market basics.",
};

const quickPrompts = [
  "How do I place a buy order?",
  "Show my latest order",
  "Explain holdings vs positions",
  "What are market hours?",
];

const TradeChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([initialBotMessage]);
  const [suggestions, setSuggestions] = useState(quickPrompts);

  const sendMessage = async (rawMessage) => {
    const message = String(rawMessage || "").trim();
    if (!message || loading) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chatbot/query", { message });
      const botAnswer = data?.answer || "I could not understand that. Please try again.";
      const nextSuggestions = Array.isArray(data?.suggestions) && data.suggestions.length ? data.suggestions : quickPrompts;

      setMessages((prev) => [...prev, { role: "bot", text: botAnswer }]);
      setSuggestions(nextSuggestions);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I am having trouble right now. Please try again in a moment.",
        },
      ]);
      setSuggestions(quickPrompts);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button
        className="trade-chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "Close Chat" : "Trade Chat"}
      </button>

      {isOpen ? (
        <div className="trade-chatbot-panel" role="dialog" aria-label="Trade chatbot">
          <div className="trade-chatbot-header">
            <h4>NiveshBot</h4>
            <span>Live query helper</span>
          </div>

          <div className="trade-chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`trade-chatbot-message ${message.role === "user" ? "is-user" : "is-bot"}`}
              >
                {message.text}
              </div>
            ))}
            {loading ? <div className="trade-chatbot-message is-bot">Typing...</div> : null}
          </div>

          <div className="trade-chatbot-suggestions">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                className="trade-chatbot-chip"
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="trade-chatbot-form" onSubmit={onSubmit}>
            <input
              className="trade-chatbot-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your trade question..."
            />
            <button type="submit" className="trade-chatbot-send" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
};

export default TradeChatbot;
