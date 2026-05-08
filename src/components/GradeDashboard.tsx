import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, Calendar, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import io from "socket.io-client";

interface Grade {
  id: string;
  name: string;
  grade: number;
  date: string;
}

export default function GradeDashboard() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({ name: "", grade: 5 });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchGrades();
    const socket = io();

    socket.on("grade:added", (newGrade: Grade) => {
      setGrades((prev) => [...prev, newGrade]);
    });

    socket.on("grade:updated", (updatedGrade: Grade) => {
      setGrades((prev) => prev.map((g) => (g.id === updatedGrade.id ? updatedGrade : g)));
    });

    socket.on("grade:deleted", (id: string) => {
      setGrades((prev) => prev.filter((g) => g.id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      setGrades(data);
    } catch (err) {
      console.error("Failed to fetch grades", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "2025") {
      setIsAdmin(true);
      setShowAdminModal(false);
    } else {
      alert("Xato parol!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/grades/${editId}` : "/api/grades";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, password }),
      });

      if (res.ok) {
        setFormData({ name: "", grade: 5 });
        setEditId(null);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error("Operation failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/grades/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startEdit = (grade: Grade) => {
    setEditId(grade.id);
    setFormData({ name: grade.name, grade: grade.grade });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Baho va Natijalar</h1>
          <p className="text-slate-500 text-sm mt-1">O'quvchilarning so'nggi baholari</p>
        </div>
        {!isAdmin ? (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-2 bg-white text-slate-700 font-bold px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-sm"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            Admin Kirish
          </button>
        ) : (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
            <Shield className="w-3 h-3" />
            Administrator
          </div>
        )}
      </div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Plus className="text-blue-600 w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-800">
              {editId ? "Bahoni o'zgartirish" : "Yangi baho qo'shish"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">O'quvchi ismi</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                placeholder="Ismi familiyasi..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Baho (1-5)</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} baho
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-blue-200 text-sm"
              >
                {editId ? "Saqlash" : "Qo'shish"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({ name: "", grade: 5 });
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-2xl transition-all text-sm"
                >
                  Bekor qilish
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-400">Yuklanmoqda...</div>
          ) : grades.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">Hozircha baholar yo'q</div>
          ) : (
            grades.map((grade) => (
              <motion.div
                key={grade.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      grade.grade === 5 ? "bg-yellow-100 text-yellow-600" : 
                      grade.grade === 4 ? "bg-green-100 text-green-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-800">{grade.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{format(new Date(grade.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-4xl font-display font-bold text-blue-600">{grade.grade}</div>
                </div>

                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(grade)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Admin Auth Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-center mb-2">Admin Kirish</h2>
              <p className="text-slate-500 text-center text-sm mb-6">Baholarni o'zgartirish uchun parolni kiriting</p>
              
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting (2025)"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg tracking-widest"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl transition-all"
                  >
                    Yopish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
