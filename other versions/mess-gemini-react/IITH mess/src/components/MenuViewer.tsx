import React, { useState } from 'react';
import { DailyMenu, MealType, MessType } from '../types/mess';
import { WEEKLY_MENUS } from '../data/mockData';

export const MenuViewer: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedMess, setSelectedMess] = useState<MessType>('Mess A');

  const dayMenu = WEEKLY_MENUS.find((m) => m.day === selectedDay) || WEEKLY_MENUS[0];
  const items = selectedMess === 'Mess A' ? dayMenu.messA : dayMenu.messB;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-4">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-black text-white">Mess Menu</h1>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedMess('Mess A')}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                selectedMess === 'Mess A' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Mess A
            </button>
            <button
              onClick={() => setSelectedMess('Mess B')}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                selectedMess === 'Mess B' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Mess B
            </button>
          </div>
        </div>

        {/* Days */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                selectedDay === day
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((session) => (
          <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-extrabold text-white">{session.session}</h3>
              <span className="text-[11px] font-mono text-amber-400">{session.timing}</span>
            </div>

            <ul className="space-y-1.5">
              {session.items.map((food, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
