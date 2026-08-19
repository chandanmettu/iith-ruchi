import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronLeft, HelpCircle, MapPin, Sparkles, Utensils } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const messes = [
  { id: 'old', label: 'Mess A', name: 'Old Mess', location: 'Vindhya Complex', plans: [{ id: 'old-uhd', label: 'UHD', name: 'Unlimited Dining', count: 827, capacity: 1000 }, { id: 'old-lhd', label: 'LHD', name: 'Lunch & Dinner', count: 944, capacity: 1000 }] },
  { id: 'new', label: 'Mess B', name: 'New Mess', location: 'Himalaya Complex', plans: [{ id: 'new-uhd', label: 'UHD', name: 'Unlimited Dining', count: 716, capacity: 1000 }, { id: 'new-lhd', label: 'LHD', name: 'Lunch & Dinner', count: 981, capacity: 1000 }] }
];

function App() {
  const [page, setPage] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => messes.flatMap(mess => mess.plans.map(plan => ({ ...plan, mess }))).find(plan => plan.id === selectedId), [selectedId]);
  if (page === 'home') return <Welcome onStart={() => setPage('choose')} />;
  if (page === 'done') return <Confirmation selection={selected} onBack={() => setPage('choose')} />;
  return <ChooseMess selectedId={selectedId} onSelect={setSelectedId} onBack={() => setPage('home')} onConfirm={() => setPage('done')} selection={selected} />;
}

function Wordmark() { return <div className="wordmark"><span className="wordmark-mark"><i></i><i></i><i></i></span><span>IITH Mess</span><b>registration</b></div>; }
function AppHeader({ compact = false }) { return <header className="app-header"><Wordmark /><div className="header-right">{!compact && <><span className="month"><CalendarDays size={15} /> July 2026</span><button className="icon-button" aria-label="Help"><HelpCircle size={19} /></button></>}</div></header>; }

function Welcome({ onStart }) {
  return <main className="app-page">
    <AppHeader />
    <section className="welcome">
      <div className="hello-row"><span className="hello-icon">🍲</span><p className="overline">JULY REGISTRATION IS OPEN</p></div>
      <h1>Hey, hungry human!<br /><span>Pick your mess.</span></h1>
      <p className="welcome-copy">Choose where you’ll eat this month. It’s quick, simple, and takes less than a minute.</p>
      <Countdown />
      <button className="button primary" onClick={onStart}>Let’s choose <ArrowRight size={18} /></button>
      <p className="quiet-note"><Sparkles size={15} /> One pick for July — choose wisely!</p>
    </section>
    <footer className="app-footer"><span>Indian Institute of Technology Hyderabad</span><span>Need help? Contact the Mess Office</span></footer>
  </main>;
}

function Countdown() {
  const getRemaining = () => {
    const now = new Date();
    const nextOpening = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
    return Math.max(0, Math.floor((nextOpening.getTime() - now.getTime()) / 1000));
  };
  const [seconds, setSeconds] = useState(getRemaining);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(getRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const pad = number => String(number).padStart(2, '0');
  return <div className="countdown"><div><span>Next registration opens in</span><small>1st of next month · 9:00 AM</small></div><strong><b>{pad(days)}</b><i>:</i><b>{pad(hours)}</b><i>:</i><b>{pad(minutes)}</b></strong></div>;
}

function ChooseMess({ selectedId, onSelect, onBack, onConfirm, selection }) {
  return <main className="app-page choose-page">
    <AppHeader compact />
    <section className="choose-content">
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> Back</button>
      <div className="choose-heading"><div><p className="overline">PICK YOUR MESS</p><h1>Where are we eating?</h1></div></div>
      <div className="mess-list">{messes.map(mess => <MessCard key={mess.id} mess={mess} selectedId={selectedId} onSelect={onSelect} />)}</div>
    </section>
    <div className={selection ? 'confirm-bar show' : 'confirm-bar'}><div><small>Nice choice!</small><strong>{selection?.mess.name} · {selection?.label}</strong></div><button className="button confirm" onClick={onConfirm}>Yep, that’s me <ArrowRight size={17} /></button></div>
  </main>;
}

function MessCard({ mess, selectedId, onSelect }) {
  return <article className={`mess-card ${mess.id}`}>
    <div className="mess-intro"><span className="mess-symbol">{mess.id === 'old' ? 'A' : 'B'}</span><div><span className="mess-label">{mess.label}</span><h2>{mess.name}</h2><p><MapPin size={14} /> {mess.location}</p></div></div>
    <div className="plan-options">{mess.plans.map(plan => {
      const isSelected = plan.id === selectedId;
      const full = plan.count >= plan.capacity;
      const filled = Math.round((plan.count / plan.capacity) * 100);
      return <button key={plan.id} className={`plan-option ${isSelected ? 'selected' : ''}`} disabled={full} onClick={() => onSelect(plan.id)}><span className="plan-select">{isSelected && <Check size={14} />}</span><span className="plan-copy"><b>{plan.label}</b><small>{plan.name}</small></span><span className="plan-chart" style={{ '--progress': `${filled * 3.6}deg` }}><i>{filled}%</i></span><span className="plan-count"><strong>{(plan.capacity - plan.count).toLocaleString()} <small>left</small></strong><em>{plan.count.toLocaleString()} filled</em></span></button>;
    })}</div>
  </article>;
}

function Confirmation({ selection, onBack }) {
  return <main className="app-page confirmation-page"><AppHeader compact /><section className="confirmation"><div className="check-circle"><Check size={29} /></div><p className="overline">YOU’RE ALL SORTED</p><h1>Yay, you’re in!</h1><p className="confirmation-copy">Your July mess spot has been saved. One less thing to think about.</p><div className="receipt"><div><small>YOUR MESS</small><strong>{selection?.mess.name}</strong><span><MapPin size={14} /> {selection?.mess.location}</span></div><div><small>YOUR PLAN</small><strong>{selection?.label}</strong><span>{selection?.name}</span></div></div><div className="access-note"><Utensils size={18} /><p><b>Just bring your IITH ID card</b><br />The mess staff will scan its barcode and check you in. That’s it!</p></div><button className="button primary" onClick={onBack}>See my choice <ArrowRight size={17} /></button><p className="change-note">Your July choice is locked in now.</p></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);
