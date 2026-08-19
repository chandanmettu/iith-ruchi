import React, { useState } from 'react';
import { CheckCircle2, Ticket, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, MessHallDetails, MessType, DiningHallType, RegistrationWindow } from '../types/mess';

interface MessBookingProps {
  currentUser: StudentProfile | null;
  messData: MessHallDetails[];
  registrationWindow: RegistrationWindow;
  onBookMess: (mess: MessType, hall: DiningHallType) => void;
  onOpenAuth: () => void;
  onViewPass: () => void;
}

export const MessBooking: React.FC<MessBookingProps> = ({
  currentUser,
  messData,
  registrationWindow,
  onBookMess,
  onOpenAuth,
  onViewPass
}) => {
  const [selectedMess, setSelectedMess] = useState<MessType>('Mess A');
  const [selectedHall, setSelectedHall] = useState<DiningHallType>('UHD');

  const handleRegisterClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onBookMess(selectedMess, selectedHall);
  };

  // Find active mess selection object
  const messA = messData.find((m) => m.id === 'Mess A') || messData[0];
  const messB = messData.find((m) => m.id === 'Mess B') || messData[1];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Simple Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>August 2026 Mess Registration Open</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Your Mess & Dining Hall
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Choose between Mess A and Mess B. Each dining hall is limited to 1,000 students.
        </p>
      </div>

      {/* Already Registered Card (if student already registered) */}
      {currentUser && currentUser.registeredMess && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Registration Confirmed
              </span>
              <h2 className="text-xl font-black text-white">
                {currentUser.registeredMess} • {currentUser.diningHall === 'UHD' ? 'Upper Dining Hall (UHD)' : 'Lower Dining Hall (LHD)'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ticket ID: {currentUser.ticketId}
              </p>
            </div>
          </div>

          <button
            onClick={onViewPass}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 text-sm shrink-0"
          >
            <Ticket className="w-4 h-4" />
            <span>View Digital Mess Pass</span>
          </button>
        </div>
      )}

      {/* 2 Simple Mess Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mess A Card */}
        <div
          onClick={() => setSelectedMess('Mess A')}
          className={`rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
            selectedMess === 'Mess A'
              ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-950/60 ring-2 ring-indigo-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Old Mess</span>
                <h3 className="text-2xl font-black text-white">Mess A</h3>
              </div>
              {selectedMess === 'Mess A' && (
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Caterer: {messA.caterer}</p>

            {/* Dining Hall Choice (UHD vs LHD) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Choose Dining Hall:</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMess('Mess A');
                    setSelectedHall('UHD');
                  }}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedMess === 'Mess A' && selectedHall === 'UHD'
                      ? 'bg-indigo-950 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">UHD (Upper)</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-1">
                    {1000 - messA.sections.UHD.filled} seats left
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMess('Mess A');
                    setSelectedHall('LHD');
                  }}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedMess === 'Mess A' && selectedHall === 'LHD'
                      ? 'bg-indigo-950 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">LHD (Lower)</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-1">
                    {1000 - messA.sections.LHD.filled} seats left
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMess('Mess A');
            }}
            className={`w-full py-3 rounded-xl font-bold text-sm transition ${
              selectedMess === 'Mess A'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {selectedMess === 'Mess A' ? 'Selected Mess A' : 'Select Mess A'}
          </button>
        </div>

        {/* Mess B Card */}
        <div
          onClick={() => setSelectedMess('Mess B')}
          className={`rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
            selectedMess === 'Mess B'
              ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-950/60 ring-2 ring-indigo-500/40'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">New Mess</span>
                <h3 className="text-2xl font-black text-white">Mess B</h3>
              </div>
              {selectedMess === 'Mess B' && (
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Caterer: {messB.caterer}</p>

            {/* Dining Hall Choice (UHD vs LHD) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Choose Dining Hall:</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMess('Mess B');
                    setSelectedHall('UHD');
                  }}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedMess === 'Mess B' && selectedHall === 'UHD'
                      ? 'bg-indigo-950 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">UHD (Upper)</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-1">
                    {1000 - messB.sections.UHD.filled} seats left
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMess('Mess B');
                    setSelectedHall('LHD');
                  }}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedMess === 'Mess B' && selectedHall === 'LHD'
                      ? 'bg-indigo-950 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">LHD (Lower)</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-1">
                    {1000 - messB.sections.LHD.filled} seats left
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMess('Mess B');
            }}
            className={`w-full py-3 rounded-xl font-bold text-sm transition ${
              selectedMess === 'Mess B'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {selectedMess === 'Mess B' ? 'Selected Mess B' : 'Select Mess B'}
          </button>
        </div>
      </div>

      {/* Clean Bottom Action Confirmation Bar */}
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase font-bold">Your Selection</span>
          <h4 className="text-xl font-black text-white mt-0.5">
            {selectedMess} • {selectedHall === 'UHD' ? 'Upper Dining Hall (UHD)' : 'Lower Dining Hall (LHD)'}
          </h4>
        </div>

        <button
          onClick={handleRegisterClick}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 text-base shrink-0"
        >
          <span>Confirm & Register</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
