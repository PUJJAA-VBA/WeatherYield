import { useState } from "react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  // 🧠 Current chat messages
  const [messages, setMessages] = useState<any[]>([]);
const [loading, setLoading] = useState(false);
  // 🧠 All previous chats
  const [history, setHistory] = useState<
  { id: number; name: string; messages: any[] }[]
>([]);

 const handleSend = async () => {
  if (!input) return;

  const userMsg = { type: "user", text: input };
  setMessages((prev) => [...prev, userMsg]);

  setLoading(true); // 🔥 START LOADING

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const botReply = {
      type: "bot",
      text: data.reply,
    };

    setMessages((prev) => [...prev, botReply]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { type: "bot", text: "⚠️ Server error" },
    ]);
  }

  setLoading(false); // 🔥 STOP LOADING
  setInput("");
};

  // ❌ CLOSE CHAT → SAVE HISTORY
  const handleClose = () => {
  if (messages.length > 0) {
    const exists = history.some(
      (chat) =>
        JSON.stringify(chat.messages) === JSON.stringify(messages)
    );

    if (!exists) {
      const newChat = {
        id: Date.now(),
        name: messages[0]?.text?.slice(0, 20) || "New Chat",
        messages,
      };

      setHistory((prev) => [newChat, ...prev]);
    }
  }

  setMessages([]);
  setOpen(false);
};

const renameChat = (id: number) => {
  const newName = prompt("Enter new chat name");
  if (!newName) return;

  setHistory((prev) =>
    prev.map((chat) =>
      chat.id === id ? { ...chat, name: newName } : chat
    )
  );
};

const deleteChat = (id: number) => {
  setHistory((prev) => prev.filter((chat) => chat.id !== id));
};

  const loadChat = (chat: any) => {
  setMessages(chat.messages);
};

  const getBotReply = (text: string) => {
    const q = text.toLowerCase();

    if (q.includes("crop"))
      return "You can choose crops based on weather and soil 🌱";

    if (q.includes("fertilizer"))
      return "Use nitrogen-rich fertilizers for better growth 🌿";

    if (q.includes("pest"))
      return "Neem oil is a good eco-friendly pest control 🐛";

    if (q.includes("rain"))
      return "Avoid irrigation if rain is expected 🌧️";

    return "Ask me anything about agriculture 🌾";
  };

  return (
    <>
      {/* 💬 Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 bg-green-600 text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>

      {/* 💬 Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-[400px] h-[450px] bg-white/30 backdrop-blur-lg border border-gray-300/30 rounded-xl shadow-lg flex">
          
          {/* 🧠 LEFT SIDE → HISTORY */}
          <div className="w-1/3 border-r border-gray-300/30 p-2 overflow-y-auto">
            <p className="text-xs font-bold mb-2 text-black">History</p>

            {history.length === 0 && (
              <p className="text-xs text-gray-600">No chats</p>
            )}

            {history.map((chat) => (
  <div
    key={chat.id}
    onClick={() => loadChat(chat)}
    className="p-2 mb-2 bg-white/40 rounded hover:bg-white/60 text-xs relative"
  >
    <div className="flex justify-between items-center">
      <span className="font-semibold">{chat.name}</span>

      {/* ⋮ MENU BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(activeMenu === chat.id ? null : chat.id);
        }}
        className="text-black text-lg"
      >
        ⋮
      </button>
    </div>

    {/* DROPDOWN MENU */}
    {activeMenu === chat.id && (
      <div className="absolute right-2 mt-1 bg-white shadow-md rounded text-xs z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            renameChat(chat.id);
            setActiveMenu(null);
          }}
          className="block px-3 py-1 hover:bg-gray-100 w-full text-left"
        >
          ✏ Rename
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteChat(chat.id);
            setActiveMenu(null);
          }}
          className="block px-3 py-1 hover:bg-red-100 text-red-500 w-full text-left"
        >
          🗑 Delete
        </button>
      </div>
    )}
  </div>
))}
          </div>

          {/* 🧠 RIGHT SIDE → CHAT */}
          <div className="flex-1 flex flex-col">

            {/* Header */}
            <div className="p-3 bg-green-600 text-white rounded-tr-xl flex justify-between items-center">
              <span className="font-bold">🌾 Agri Assistant</span>

              {/* ❌ CLOSE BUTTON */}
              <button
  onClick={handleClose}
  className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/70 text-white px-2 py-1 rounded-md transition"
>
  ✖
</button>
            </div>

            {/* Messages */}
            <div className="p-3 flex-1 overflow-y-auto space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-green-200 text-right"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex border-t border-gray-300/30">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something..."
                className="placeholder:text-black/40 flex-1 p-2 bg-transparent outline-none"
              />
              <button
                onClick={handleSend}
                className="px-3 text-green-600 font-bold"
              >
                ➤
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}