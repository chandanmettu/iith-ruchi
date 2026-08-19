/**
 * IITH Mess Portal Engine - LookAway.com & SupaSte.com Inspired
 * Dark Obsidian Glass • 3D Parallax Tilt • Particle Micro-Burst
 */

let currentSelectedMess = 'Mess A';
let currentSelectedHall = 'UHD';

document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  animateProgressBars();
  initMagneticParallax();
});

/**
 * Live Countdown Timer Logic
 */
function initCountdownTimer() {
  let totalSeconds = (2 * 24 * 3600) + (13 * 3600) + (24 * 60) + 41;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      return;
    }

    totalSeconds--;

    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
  }

  const timerInterval = setInterval(updateTimer, 1000);
}

/**
 * 3D Magnetic Parallax & Cursor Spotlight
 */
function initMagneticParallax() {
  const cards = document.querySelectorAll('.sexy-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spotlight coordinates
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.setProperty('--rotate-x', `${rotateX}deg`);
      card.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
    });
  });
}

/**
 * Animate progress bars smoothly on load
 */
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.bar-fill');
  progressBars.forEach((bar) => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 150);
  });
}

/**
 * Handle Mess & Dining Hall Selection
 */
function selectMess(messName, hallName) {
  currentSelectedMess = messName;
  currentSelectedHall = hallName;

  const cardA = document.getElementById('card-mess-a');
  const cardB = document.getElementById('card-mess-b');
  const btnA = document.getElementById('btn-mess-a');
  const btnB = document.getElementById('btn-mess-b');

  const optA_UHD = document.getElementById('option-mess-a-uhd');
  const optA_LHD = document.getElementById('option-mess-a-lhd');
  const optB_UHD = document.getElementById('option-mess-b-uhd');
  const optB_LHD = document.getElementById('option-mess-b-lhd');

  // Deactivate all section pills
  [optA_UHD, optA_LHD, optB_UHD, optB_LHD].forEach((opt) => opt?.classList.remove('active'));

  if (messName === 'Mess A') {
    cardA.classList.add('active');
    cardB.classList.remove('active');

    btnA.querySelector('span').textContent = `Confirm Mess A (${hallName})`;
    btnB.querySelector('span').textContent = 'Select Mess B';

    if (hallName === 'UHD') optA_UHD?.classList.add('active');
    else optA_LHD?.classList.add('active');
  } else {
    cardB.classList.add('active');
    cardA.classList.remove('active');

    btnB.querySelector('span').textContent = `Confirm Mess B (${hallName})`;
    btnA.querySelector('span').textContent = 'Select Mess A';

    if (hallName === 'UHD') optB_UHD?.classList.add('active');
    else optB_LHD?.classList.add('active');
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Handle Registration Confirmation & Trigger Micro Particle Burst
 */
function confirmRegistration(messName, event) {
  if (messName !== currentSelectedMess) {
    selectMess(messName, 'UHD');
    return;
  }

  if (event) {
    triggerParticleBurst(event.clientX, event.clientY);
  }

  showToast(`✓ Registered for ${currentSelectedMess} (${currentSelectedHall}) for July 2026!`);
}

/**
 * Micro Particle Burst FX Engine
 */
function triggerParticleBurst(originX, originY) {
  const canvas = document.getElementById('burst-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#FF5B00', '#FF7A00', '#FFD8BE', '#FFFFFF'];

  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.03 + 0.015,
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach((p) => {
      if (p.alpha > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
      }
    });

    if (activeParticles > 0) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

/**
 * Toast Notification Banner
 */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(17, 22, 34, 0.9);
      backdrop-filter: blur(16px);
      color: #FFFFFF;
      padding: 14px 22px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      z-index: 3000;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      transform: translateY(12px);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 3500);
}
