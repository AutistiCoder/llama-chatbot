import React, { useState, useRef, useEffect } from "react";
import { Message } from "./types.ts";
import { chat } from "./chatbot.ts"; // Import the chatbot API
import "./ChatWindow.css";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Welcome! Feel free to ask anything." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to chat history
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call chatbot function to get streamed response
      const reader = await chat([...messages, userMessage]);

      // Remove typing indicator when response starts streaming
      setIsTyping(false);

      let currentText = "";
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        currentText += decoder.decode(value, { stream: true });

        // Update the last assistant message dynamically
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: currentText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">Chat Assistant</div>

      {/* Messages List */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user"
                ? "user-message"
                : msg.role === "assistant"
                ? "assistant-message"
                : "system-message"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="assistant-message typing-indicator">
            <span>.</span> <span>.</span> <span>.</span>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button className="send-button" onClick={handleSendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;



