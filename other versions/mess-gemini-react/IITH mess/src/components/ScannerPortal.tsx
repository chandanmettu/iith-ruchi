import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle } from 'lucide-react';
import { StudentProfile, ScanVerificationResult, MessType } from '../types/mess';

interface ScannerPortalProps {
  currentMess: MessType;
  setCurrentMess: (mess: MessType) => void;
  registeredStudents: StudentProfile[];
}

export const ScannerPortal: React.FC<ScannerPortalProps> = ({
  currentMess,
  setCurrentMess,
  registeredStudents
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [result, setResult] = useState<ScanVerificationResult | null>(null);

  const handleVerify = (query: string) => {
    if (!query.trim()) return;
    const cleanQ = query.trim().toUpperCase();

    const student = registeredStudents.find(
      (s) =>
        s.rollNo.toUpperCase() === cleanQ ||
        (s.ticketId && s.ticketId.toUpperCase() === cleanQ) ||
        s.email.toLowerCase().includes(cleanQ.toLowerCase())
    );

    const nowStr = new Date().toLocaleTimeString();

    if (!student || !student.registeredMess) {
      setResult({
        status: 'not_registered',
        scannedAt: nowStr,
        scannedMeal: 'Lunch',
        message: 'STUDENT NOT REGISTERED FOR THIS MONTH',
        messName: currentMess
      });
    } else if (student.registeredMess !== currentMess) {
      setResult({
        status: 'wrong_mess',
        student,
        scannedAt: nowStr,
        scannedMeal: 'Lunch',
        message: `WRONG MESS! Registered in ${student.registeredMess} (${student.diningHall})`,
        messName: currentMess
      });
    } else {
      setResult({
        status: 'valid',
        student,
        scannedAt: nowStr,
        scannedMeal: 'Lunch',
        message: `VALID ENTRY: ${student.name} (${student.diningHall})`,
        messName: currentMess
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 pt-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-black text-white">Gate Scanner</h1>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentMess('Mess A')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                currentMess === 'Mess A' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Mess A
            </button>
            <button
              onClick={() => setCurrentMess('Mess B')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                currentMess === 'Mess B' ? 'bg-emerald-600 text-white' : 'text-slate-400'
              }`}
            >
              Mess B
            </button>
          </div>
        </div>

        {/* Quick Click Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => handleVerify('CS21BTECH11001')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-300 rounded-lg border border-slate-700"
          >
            CS21BTECH11001 (Mess A)
          </button>
          <button
            onClick={() => handleVerify('EE22MTECH12004')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-indigo-300 rounded-lg border border-slate-700"
          >
            EE22MTECH12004 (Mess B)
          </button>
          <button
            onClick={() => handleVerify('AI23BTECH11015')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-rose-300 rounded-lg border border-slate-700"
          >
            AI23BTECH11015 (Unregistered)
          </button>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(inputQuery);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Enter Roll Number or Scan QR..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Result Display Card */}
      {result && (
        <div
          className={`p-6 rounded-3xl border-2 shadow-2xl flex items-center space-x-4 ${
            result.status === 'valid'
              ? 'bg-slate-900 border-emerald-500 text-emerald-300'
              : 'bg-slate-900 border-rose-500 text-rose-300'
          }`}
        >
          {result.status === 'valid' ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-12 h-12 text-rose-500 shrink-0" />
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              {result.status === 'valid' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              {result.student ? result.student.name : 'Unregistered Student'}
            </h3>
            <p className="text-xs font-mono mt-1">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
