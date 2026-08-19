import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket, Download, Printer, ShieldCheck, User } from 'lucide-react';
import { StudentProfile } from '../types/mess';

interface DigitalPassProps {
  currentUser: StudentProfile | null;
  onOpenAuth: () => void;
  onGoToBooking: () => void;
}

export const DigitalPass: React.FC<DigitalPassProps> = ({ currentUser, onOpenAuth, onGoToBooking }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (currentUser && currentUser.ticketId) {
      const qrText = `IITH-VERIFIED|ROLL:${currentUser.rollNo}|MESS:${currentUser.registeredMess}|HALL:${currentUser.diningHall}|TICKET:${currentUser.ticketId}`;
      QRCode.toDataURL(qrText, { width: 220, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">Please sign in to view your digital mess pass.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!currentUser.registeredMess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto my-12 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white">No Mess Registration Found</h2>
        <p className="text-xs text-slate-400">You haven't registered for August 2026 mess yet.</p>
        <button
          onClick={onGoToBooking}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow"
        >
          Register Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12 pt-4">
      {/* Clean Digital Pass Card */}
      <div className="rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-white">IITH Mess Pass</h2>
            <p className="text-[10px] text-slate-400 font-mono">August 2026</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
            ACTIVE
          </span>
        </div>

        {/* Details & QR */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs font-mono text-amber-400 font-bold">{currentUser.rollNo}</p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 block uppercase">Allocated Hall</span>
              <strong className="text-white text-sm">
                {currentUser.registeredMess} ({currentUser.diningHall})
              </strong>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">Ticket: {currentUser.ticketId}</p>
          </div>

          <div className="p-2 bg-white rounded-xl shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR" className="w-28 h-28" />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-400">
                QR Code...
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition flex items-center justify-center space-x-2"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Print / Save Pass</span>
        </button>
      </div>
    </div>
  );
};
