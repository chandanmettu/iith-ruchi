import React, { useState } from 'react';
import { ArrowRightLeft, User, Mail, Sparkles, Plus, CheckCircle } from 'lucide-react';
import { MessSwapOffer, StudentProfile, MessType, DiningHallType } from '../types/mess';
import { INITIAL_SWAP_REQUESTS } from '../data/mockData';

interface SwapRequestsProps {
  currentUser: StudentProfile | null;
  onOpenAuth: () => void;
}

export const SwapRequests: React.FC<SwapRequestsProps> = ({ currentUser, onOpenAuth }) => {
  const [swaps, setSwaps] = useState<MessSwapOffer[]>(INITIAL_SWAP_REQUESTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetMess, setTargetMess] = useState<MessType>('Mess B');
  const [targetHall, setTargetHall] = useState<DiningHallType>('UHD');

  const handlePostSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.registeredMess || !currentUser.diningHall) {
      alert('You must have an active Mess Registration to offer a swap!');
      return;
    }

    const newOffer: MessSwapOffer = {
      id: `swap-${Date.now()}`,
      studentName: currentUser.name,
      rollNo: currentUser.rollNo,
      currentMess: currentUser.registeredMess,
      targetMess,
      currentHall: currentUser.diningHall,
      targetHall,
      contactEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      status: 'open'
    };

    setSwaps([newOffer, ...swaps]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <span>STUDENT MESS SWAP BOARD</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">Peer-to-Peer Mess Exchange</h1>
            <p className="text-sm text-slate-300 mt-1">
              Want to switch from Mess A to Mess B or vice versa? Trade your allocated slot with fellow students.
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setShowCreateModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-purple-600/30 transition flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Post Swap Offer</span>
          </button>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {swaps.map((offer) => (
          <div
            key={offer.id}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{offer.studentName}</h3>
                  <p className="text-xs font-mono text-amber-400">{offer.rollNo}</p>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE OFFER
              </span>
            </div>

            {/* Swap visual */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Has</span>
                <span className="text-sm font-black text-rose-400">{offer.currentMess}</span>
                <span className="text-[10px] text-slate-500 block">({offer.currentHall})</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Wants</span>
                <span className="text-sm font-black text-emerald-400">{offer.targetMess}</span>
                <span className="text-[10px] text-slate-500 block">({offer.targetHall})</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <a
                href={`mailto:${offer.contactEmail}`}
                className="flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-mono font-semibold"
              >
                <Mail className="w-4 h-4" />
                <span>{offer.contactEmail}</span>
              </a>

              <button
                onClick={() => alert(`Contact ${offer.studentName} at ${offer.contactEmail} to finalize your mess swap!`)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow"
              >
                Contact to Swap
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for creating a swap offer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-black text-white">Offer Mess Swap</h3>

            {currentUser && currentUser.registeredMess ? (
              <form onSubmit={handlePostSwap} className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span>Current Mess: </span>
                  <strong className="text-amber-400">{currentUser.registeredMess} ({currentUser.diningHall})</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Mess You Want</label>
                  <select
                    value={targetMess}
                    onChange={(e) => setTargetMess(e.target.value as MessType)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="Mess A">Mess A (Old Mess)</option>
                    <option value="Mess B">Mess B (New Mess)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Dining Section</label>
                  <select
                    value={targetHall}
                    onChange={(e) => setTargetHall(e.target.value as DiningHallType)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none"
                  >
                    <option value="UHD">Upper Dining Hall (UHD)</option>
                    <option value="LHD">Lower Dining Hall (LHD)</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg"
                  >
                    Post Offer
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-slate-400">You must register for a mess first before offering a swap.</p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
