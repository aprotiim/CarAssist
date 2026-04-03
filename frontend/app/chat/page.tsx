"use client";

import { useRef, useEffect } from "react";
import { useChat } from "ai/react";

const QUICK_QUESTIONS = [
  "How do I negotiate the price?",
  "What to check on a test drive?",
  "Is a salvage title bad?",
  "How does EV financing work?",
];

function renderMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm your used car buying assistant powered by Claude AI. Ask me anything about buying a used car — inspections, financing, negotiation tips, common scams, or anything else!",
        },
      ],
    });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    append({ role: "user", content: question });
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      <div className="mb-4">
        <h2 className="font-mono text-xl font-bold text-white">
          Buying Assistant
        </h2>
        <p className="text-muted text-sm mt-0.5">
          Powered by Claude AI + RAG knowledge base
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-7 whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-gradient-to-br from-sage-600 to-sage-500 text-white"
                : "self-start bg-[rgba(20,20,40,0.9)] border border-sage-300/[0.08] text-dim"
            }`}
          >
            {renderMarkdown(msg.content)}
          </div>
        ))}

        {isLoading && (
          <div className="self-start max-w-[80%] px-4 py-3 rounded-xl bg-[rgba(20,20,40,0.9)] border border-sage-300/[0.08] text-sage-300 text-sm animate-pulse">
            Thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-sage-300/[0.08] pt-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about inspections, financing, scams..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickQuestion(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-md border border-dark-500 bg-sage-300/[0.04] text-sage-300 text-xs cursor-pointer hover:bg-sage-300/10 transition-all disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
