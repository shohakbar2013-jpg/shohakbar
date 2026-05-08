/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import GradeDashboard from "./components/GradeDashboard";
import Chat from "./components/Chat";
import { BookOpen, MessageCircle, LayoutDashboard, Languages } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Languages className="w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              English Junior
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Baholar
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </nav>

          <div className="flex items-center gap-2">
             <div className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dashboard Area */}
          <div className={`${activeTab === "dashboard" ? "lg:col-span-8" : "hidden lg:block lg:col-span-8"}`}>
            <GradeDashboard />
          </div>

          {/* Chat Sidebar on desktop, or full screen switch on mobile */}
          <div className={`${activeTab === "chat" ? "lg:col-span-4" : "hidden lg:block lg:col-span-4"}`}>
            <Chat />
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-2 py-2 rounded-2xl border border-white shadow-2xl flex gap-1 z-50">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "dashboard"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Baholar
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "chat"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "text-slate-500"
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          Chat
        </button>
      </div>
    </div>
  );
}

