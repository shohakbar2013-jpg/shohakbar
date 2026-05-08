import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Send, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [userName, setUserName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("chat:history", (history: Message[]) => {
      setMessages(history);
    });

    socketRef.current.on("chat:message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && userName) {
      socketRef.current?.emit("chat:message", {
        user: userName,
        text: inputText,
      });
      setInputText("");
    }
  };

  if (!isJoined) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md mx-auto mt-10 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <User className="text-blue-600 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Chatga qo'shiling</h2>
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Ismingizni kiriting</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ismingiz..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            Kirish
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col h-[600px] border border-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50 border-bottom border-slate-100 flex items-center gap-3">
        <MessageCircle className="text-blue-600 w-5 h-5" />
        <h2 className="font-display font-bold text-slate-800">Jonli Chat</h2>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Online</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.user === userName ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {msg.user}
                </span>
                <span className="text-[10px] text-slate-300">
                  {format(new Date(msg.timestamp), "HH:mm")}
                </span>
              </div>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                  msg.user === userName
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Xabar yozing..."
          className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
