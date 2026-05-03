// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== FOOTER YEAR =====
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start;
    if (start >= target) clearInterval(timer);
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
let statsAnimated = false;
function tryAnimateStats() {
  if (statsAnimated) return;
  const hero = document.querySelector('.hero');
  const rect = hero.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    statsAnimated = true;
    statNums.forEach(el => {
      animateCounter(el, parseInt(el.dataset.target));
    });
  }
}
window.addEventListener('scroll', tryAnimateStats);
setTimeout(tryAnimateStats, 400);

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.knowledge-card, .insight-card, .skill-item, .timeline-item, .goal-card, .section-header'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ===== SKILL BARS =====
const skillFills = document.querySelectorAll('.skill-fill, .goal-progress-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.style.width = el.dataset.width + '%';
      skillObserver.unobserve(el);
    }
  });
}, { threshold: 0.3 });
skillFills.forEach(el => skillObserver.observe(el));

// ===== RADAR CHART =====
function drawRadar() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const R = 130;

  const labels = ['系统设计','后端开发','产品思维','数据分析','技术写作','团队协作'];
  const values = [0.85, 0.90, 0.72, 0.68, 0.78, 0.88];
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;

  // bg rings
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(r => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + Math.cos(angle) * R * r;
      const y = cy + Math.sin(angle) * R * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  });

  // axes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
    ctx.stroke();
  }

  // data
  const grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  grad.addColorStop(0, 'rgba(124,58,237,0.5)');
  grad.addColorStop(1, 'rgba(37,99,235,0.5)');

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + Math.cos(angle) * R * values[i];
    const y = cy + Math.sin(angle) * R * values[i];
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(168,85,247,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // dots
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + Math.cos(angle) * R * values[i];
    const y = cy + Math.sin(angle) * R * values[i];
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();
    ctx.strokeStyle = '#1e1e3a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // labels
  ctx.font = '13px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(200,200,220,0.85)';
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const lx = cx + Math.cos(angle) * (R + 22);
    const ly = cy + Math.sin(angle) * (R + 22) + 5;
    ctx.fillText(labels[i], lx, ly);
  }
}

// Animate radar on scroll
const radarWrap = document.querySelector('.skills-radar-wrap');
if (radarWrap) {
  const radarObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      drawRadar();
      radarObs.disconnect();
    }
  }, { threshold: 0.3 });
  radarObs.observe(radarWrap);
}

// ===== LOAD MORE =====
document.getElementById('loadMoreBtn')?.addEventListener('click', function () {
  this.textContent = '✓ 已是最新内容';
  this.disabled = true;
  this.style.opacity = '0.5';
});

// ===== MOBILE NAV =====
document.getElementById('navToggle')?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '64px';
  links.style.left = '0'; links.style.right = '0';
  links.style.background = 'rgba(8,8,16,0.95)';
  links.style.padding = '16px 24px 24px';
  links.style.backdropFilter = 'blur(20px)';
  links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? '#a855f7' : '';
  });
});
