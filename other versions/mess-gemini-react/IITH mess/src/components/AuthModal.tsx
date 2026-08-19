import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, User, GraduationCap } from 'lucide-react';
import { StudentProfile } from '../types/mess';
import { DEMO_STUDENTS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: StudentProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSelectUser }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRoll, setCustomRoll] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim().endsWith('@iith.ac.in')) {
      setErrorMsg('Access Denied: Only official @iith.ac.in emails are allowed for Mess Registration.');
      return;
    }

    const newUser: StudentProfile = {
      id: Date.now().toString(),
      name: customName || 'IITH Student',
      email: customEmail.toLowerCase(),
      rollNo: customRoll.toUpperCase() || 'CS23BTECH11999',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech',
      hostelBlock: 'Aryabhata Block (B-02)',
      roomNo: '304',
      registeredMess: null,
      diningHall: null,
      bookingTimestamp: null,
      ticketId: null,
      qrCodeValue: null,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      isIITHMail: true
    };

    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-950 overflow-hidden">
        {/* Top Glow Bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">IITH Single Sign-On</h2>
            <p className="text-sm text-slate-400 mt-1">
              Sign in with your official <span className="text-amber-400 font-mono font-semibold">@iith.ac.in</span> Google Workspace account
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Persona Selection for Instant Testing */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Test Demo Personas</span>
              </span>
              <span className="text-[10px] text-slate-400">One-click sign in</span>
            </div>

            <div className="space-y-2">
              {DEMO_STUDENTS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    onSelectUser(st);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={st.avatarUrl}
                      alt={st.name}
                      className="w-9 h-9 rounded-full object-cover border border-indigo-400/30"
                    />
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">
                        {st.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {st.rollNo} • {st.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {st.registeredMess ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {st.registeredMess} ({st.diningHall})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Not Registered
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-slate-900 text-xs text-slate-500 font-medium uppercase tracking-wider">
              Or Enter Details Manually
            </span>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Email (@iith.ac.in)
              </label>
              <input
                type="email"
                required
                placeholder="cs23btech11000@iith.ac.in"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Kumar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="CS23BTECH11000"
                  value={customRoll}
                  onChange={(e) => setCustomRoll(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:scale-[1.01] mt-2 flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In with IITH Mail</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
