import React, { useState } from 'react';
import { UserCheck, Shield, Settings, Download, RefreshCw, Layers, CheckCircle2, Sliders, Users, AlertCircle } from 'lucide-react';
import { MessHallDetails, RegistrationWindow, StudentProfile } from '../types/mess';
import { DEMO_STUDENTS } from '../data/mockData';

interface AdminDashboardProps {
  registrationWindow: RegistrationWindow;
  setRegistrationWindow: React.Dispatch<React.SetStateAction<RegistrationWindow>>;
  messData: MessHallDetails[];
  setMessData: React.Dispatch<React.SetStateAction<MessHallDetails[]>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  registrationWindow,
  setRegistrationWindow,
  messData,
  setMessData
}) => {
  const [students, setStudents] = useState<StudentProfile[]>(DEMO_STUDENTS);
  const [searchFilter, setSearchFilter] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const toggleWindowStatus = () => {
    setRegistrationWindow((prev) => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Roll No,Name,Email,Mess,Dining Hall,Ticket ID,Booking Date']
        .concat(
          students.map(
            (s) =>
              `${s.rollNo},"${s.name}",${s.email},${s.registeredMess || 'None'},${s.diningHall || 'None'},${s.ticketId || 'None'},${s.bookingTimestamp || ''}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IITH_Mess_Registrations_${registrationWindow.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>OFFICE OF CHIEF WARDEN</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">Warden Admin Control Center</h1>
            <p className="text-sm text-slate-300 mt-1">
              Manage monthly mess registration windows, set section capacity limits, monitor real-time allocations, and export records.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center space-x-2 shrink-0"
          >
            <Download className="w-5 h-5" />
            <span>Export CSV Registrations</span>
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>CSV Export downloaded successfully for {registrationWindow.month}!</span>
        </div>
      )}

      {/* Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Window Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Portal Registration Window</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-bold">Window Status</span>
                <span
                  className={`text-sm font-black ${
                    registrationWindow.isOpen ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {registrationWindow.isOpen ? 'OPEN FOR STUDENTS' : 'CLOSED / LOCKED'}
                </span>
              </div>

              <button
                onClick={toggleWindowStatus}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                  registrationWindow.isOpen
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {registrationWindow.isOpen ? 'Lock Window' : 'Open Window'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Active Month</span>
                <span className="font-bold text-white font-mono">{registrationWindow.month}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total Registrations</span>
                <span className="font-bold text-amber-400 font-mono">
                  {registrationWindow.totalRegistered} / {registrationWindow.totalCap}
                </span>
              </div>
            </div>
          </div>

          {/* Section Capacities Control */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Section Capacity Limits (Default 1,000)
            </h3>

            {messData.map((mess) => (
              <div key={mess.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="font-extrabold text-white block">{mess.displayName}</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">UHD Max Cap</span>
                    <input
                      type="number"
                      value={mess.sections.UHD.capacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1000;
                        setMessData((prev) =>
                          prev.map((m) =>
                            m.id === mess.id
                              ? { ...m, sections: { ...m.sections, UHD: { ...m.sections.UHD, capacity: val } } }
                              : m
                          )
                        );
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">LHD Max Cap</span>
                    <input
                      type="number"
                      value={mess.sections.LHD.capacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1000;
                        setMessData((prev) =>
                          prev.map((m) =>
                            m.id === mess.id
                              ? { ...m, sections: { ...m.sections, LHD: { ...m.sections.LHD, capacity: val } } }
                              : m
                          )
                        );
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Registrations Audit List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3 gap-2">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Student Registration Audit Trail</span>
            </h3>

            <input
              type="text"
              placeholder="Filter by Roll No or Name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-950 text-xs text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Allocated Mess</th>
                  <th className="p-3">Dining Hall</th>
                  <th className="p-3">Ticket ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-950/50">
                    <td className="p-3 font-semibold text-white flex items-center space-x-2">
                      <img src={st.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                      <span>{st.name}</span>
                    </td>
                    <td className="p-3 font-mono text-amber-400">{st.rollNo}</td>
                    <td className="p-3">
                      {st.registeredMess ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          {st.registeredMess}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-italic">Unregistered</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-300">{st.diningHall || '-'}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{st.ticketId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
