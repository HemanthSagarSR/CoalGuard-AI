import { useQuery, useMutation, useAction } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Send, Loader2, MessageSquare, Sparkles } from "lucide-react";

const suggestedQuestions = [
  "Which mines are currently high risk?",
  "Which compliance requirements are overdue?",
  "Show me recurring safety violations.",
  "Which mine requires immediate attention?",
  "Summarize this month's compliance performance.",
  "What should management prioritize?",
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const askAssistant = useAction(api.chat.askAssistant);
  const saveMessage = useMutation(api.chat.saveMessage);
  const messages = useQuery(api.chat.getMessages, user ? { userId: user._id } : "skip");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || !user || loading) return;
    setInput("");
    setLoading(true);

    await saveMessage({ userId: user._id, role: "user", content: q });

    try {
      const response = await askAssistant({ userId: user._id, question: q });
      await saveMessage({ userId: user._id, role: "assistant", content: response });
    } catch {
      await saveMessage({ userId: user._id, role: "assistant", content: "I encountered an error. Please try again." });
    }

    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">AI Governance Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">Ask questions about mine compliance, risk, and governance</p>
        </div>

        {/* Chat area */}
        <div className="flex-1 clay-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome message */}
            {(!messages || messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="clay-inset flex h-16 w-16 items-center justify-center rounded-3xl mb-4">
                  <Sparkles className="h-8 w-8 text-[#8B7EC8]" />
                </div>
                <h3 className="text-lg font-bold mb-1">CoalGuard AI-V1 Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  Ask about mine risk levels, compliance status, violations, and governance insights.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="clay-inset text-left text-xs px-4 py-3 rounded-xl hover:bg-white/50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages?.map((msg: any) => (
              <div key={msg._id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#5B7F6E] text-white rounded-br-md"
                    : "clay-inset rounded-bl-md"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-[#8B7EC8]" />
                      <span className="text-[10px] font-bold text-[#8B7EC8] uppercase">CoalGuard AI-V1</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="clay-inset rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#8B7EC8]" />
                  <span className="text-sm text-muted-foreground">Analyzing data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/30 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about mine compliance, risk, governance..."
                className="clay-input flex-1 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="clay-button flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
