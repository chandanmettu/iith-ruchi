import React, { useState } from 'react';
import { LogOut, CheckCircle2, User, Lock, AlertCircle, Clock, Utensils, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MessSection {
  capacity: number; // 1000
  booked: number;
}

interface MessOption {
  id: 'Mess A' | 'Mess B';
  name: string;
  type: string;
  caterer: string;
  uhd: MessSection;
  lhd: MessSection;
}

export const App: React.FC = () => {
  // Login State
  const [user, setUser] = useState<{ email: string; name: string; rollNo: string } | null>({
    email: 'student@iith.ac.in',
    name: 'IITH Student',
    rollNo: 'CS21BTECH11001'
  });

  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Mess Capacities (Strictly capped at 1000 per section)
  const [messes, setMesses] = useState<MessOption[]>([
    {
      id: 'Mess A',
      name: 'Mess A',
      type: 'Old Mess',
      caterer: 'Sri Krishna Caterers',
      uhd: { capacity: 1000, booked: 842 },
      lhd: { capacity: 1000, booked: 915 }
    },
    {
      id: 'Mess B',
      name: 'Mess B',
      type: 'New Mess',
      caterer: 'Delight Hospitality',
      uhd: { capacity: 1000, booked: 954 },
      lhd: { capacity: 1000, booked: 688 }
    }
  ]);

  // Selected registration choices
  const [selectedMess, setSelectedMess] = useState<'Mess A' | 'Mess B'>('Mess A');
  const [selectedHall, setSelectedHall] = useState<'UHD' | 'LHD'>('UHD');

  // Student's confirmed registration
  const [registeredMess, setRegisteredMess] = useState<{
    mess: 'Mess A' | 'Mess B';
    hall: 'UHD' | 'LHD';
    timestamp: string;
  } | null>(null);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.toLowerCase().endsWith('@iith.ac.in')) {
      setLoginError('Please enter a valid @iith.ac.in email address.');
      return;
    }

    const roll = emailInput.split('@')[0].toUpperCase();
    setUser({
      email: emailInput.toLowerCase(),
      name: roll,
      rollNo: roll
    });
    setLoginError('');
  };

  // Handle Registration
  const handleRegister = () => {
    if (!user) return;

    // Check capacity
    const targetMess = messes.find((m) => m.id === selectedMess);
    if (!targetMess) return;

    const targetSection = selectedHall === 'UHD' ? targetMess.uhd : targetMess.lhd;

    if (targetSection.booked >= targetSection.capacity) {
      alert(`${selectedMess} (${selectedHall}) is fully booked! Please select another option.`);
      return;
    }

    // Confetti explosion
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    // Increment booked count
    setMesses((prev) =>
      prev.map((m) => {
        if (m.id === selectedMess) {
          const hallKey = selectedHall === 'UHD' ? 'uhd' : 'lhd';
          return {
            ...m,
            [hallKey]: {
              ...m[hallKey],
              booked: m[hallKey].booked + 1
            }
          };
        }
        return m;
      })
    );

    // Save registration
    setRegisteredMess({
      mess: selectedMess,
      hall: selectedHall,
      timestamp: new Date().toLocaleString()
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-slate-800 font-sans pb-16 selection:bg-amber-500 selection:text-white">
      {/* Soft Tactile Navbar */}
      <header className="py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto clay-card p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-sm">
              🍱
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-800 tracking-tight">IITH Mess Registration</h1>
              <p className="text-[10px] text-slate-500 font-medium">IIT Hyderabad Student Portal</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="clay-card-inset px-3 py-1.5 text-right">
                <div className="text-xs font-extrabold text-slate-800">{user.name}</div>
                <div className="text-[10px] text-amber-600 font-mono font-semibold">{user.email}</div>
              </div>
              <button
                onClick={() => setUser(null)}
                className="p-2.5 clay-button-neutral text-slate-600 hover:text-rose-600"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-500 px-3 py-1 clay-card-inset">
              Not Signed In
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-8">
        {/* If user is not logged in */}
        {!user ? (
          <div className="max-w-md mx-auto clay-card p-8 text-center space-y-6 my-8">
            <div className="w-14 h-14 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Student Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">
                Use your official <span className="text-amber-600 font-bold font-mono">@iith.ac.in</span> email
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs text-left flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                placeholder="cs21btech11001@iith.ac.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3.5 clay-card-inset text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full py-3.5 clay-button-amber text-sm font-bold tracking-wide"
              >
                Sign In with IITH Email
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Status Header */}
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>August 2026 Registration Window Open</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800">Select Mess & Dining Hall</h2>
              </div>

              <div className="clay-card-inset px-4 py-2 text-center sm:text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Capacity Limit</span>
                <span className="text-sm font-black text-amber-600">1,000 Seats / Section</span>
              </div>
            </div>

            {/* If Already Registered */}
            {registeredMess ? (
              <div className="clay-card p-8 text-center space-y-4 border-2 border-emerald-400">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                    Registration Confirmed
                  </span>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    {registeredMess.mess} • {registeredMess.hall}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Allocated to <span className="font-mono font-bold text-slate-700">{user.email}</span> on {registeredMess.timestamp}.
                  </p>
                </div>
              </div>
            ) : (
              /* Mess Cards Grid */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {messes.map((mess) => (
                    <div
                      key={mess.id}
                      onClick={() => setSelectedMess(mess.id)}
                      className={`clay-card p-6 sm:p-7 space-y-5 cursor-pointer transition border-2 ${
                        selectedMess === mess.id
                          ? 'border-amber-500 ring-2 ring-amber-400/30'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                            {mess.type}
                          </span>
                          <h3 className="text-2xl font-black text-slate-800">{mess.name}</h3>
                          <p className="text-[11px] text-slate-500">{mess.caterer}</p>
                        </div>
                        {selectedMess === mess.id && (
                          <span className="px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full shadow-sm">
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Dining Hall Choice (UHD vs LHD) */}
                      <div className="space-y-3 pt-1">
                        <span className="text-xs font-bold text-slate-700 block">Choose Dining Hall:</span>

                        {/* UHD */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMess(mess.id);
                            setSelectedHall('UHD');
                          }}
                          className={`p-4 rounded-2xl transition cursor-pointer ${
                            selectedMess === mess.id && selectedHall === 'UHD'
                              ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                              : 'clay-card-inset hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800">UHD (Upper Dining Hall)</span>
                            <span className="font-mono text-amber-600 font-extrabold">
                              {1000 - mess.uhd.booked} / 1000 seats left
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2.5 overflow-hidden p-0.5 shadow-inner">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(mess.uhd.booked / 1000) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* LHD */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMess(mess.id);
                            setSelectedHall('LHD');
                          }}
                          className={`p-4 rounded-2xl transition cursor-pointer ${
                            selectedMess === mess.id && selectedHall === 'LHD'
                              ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                              : 'clay-card-inset hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800">LHD (Lower Dining Hall)</span>
                            <span className="font-mono text-amber-600 font-extrabold">
                              {1000 - mess.lhd.booked} / 1000 seats left
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2.5 overflow-hidden p-0.5 shadow-inner">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(mess.lhd.booked / 1000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Registration Action Bar */}
                <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Selected Choice</span>
                    <h4 className="text-xl font-black text-slate-800">
                      {selectedMess} • {selectedHall === 'UHD' ? 'Upper Dining Hall (UHD)' : 'Lower Dining Hall (LHD)'}
                    </h4>
                  </div>

                  <button
                    onClick={handleRegister}
                    className="w-full sm:w-auto px-8 py-4 clay-button-amber font-extrabold text-sm tracking-wide shrink-0"
                  >
                    Confirm & Register Slot
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
