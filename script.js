// ===== THEME TOGGLE =====
const themeBtn = document.getElementById('themeToggleBtn');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

function setTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  sunIcon.style.display = isDark ? 'none' : 'block';
  moonIcon.style.display = isDark ? 'block' : 'none';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if(window.radarObs && document.getElementById('radarChart')) drawRadar(); // redraw radar if needed
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme === 'dark');
}

themeBtn?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

// ===== NAVBAR & SCROLL =====
const navbar = document.getElementById('navbar');
const goTopBtn = document.getElementById('goTopBtn');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  
  if (goTopBtn) {
    if (window.scrollY > 400) goTopBtn.classList.add('visible');
    else goTopBtn.classList.remove('visible');
  }
});

goTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== FOOTER YEAR =====
const yearEl = document.getElementById('footer-year');
if(yearEl) yearEl.textContent = new Date().getFullYear();

// ===== SEARCH MODAL (CMD+K) =====
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const openSearchBtn = document.getElementById('openSearchBtn');
const heroSearchBtn = document.getElementById('heroSearchBtn');
const searchResults = document.getElementById('searchResults');

// Mock data for search
const searchData = [
  { title: '微服务拆分原则与实践', desc: '技术研究 / 后端', link: '#knowledge' },
  { title: 'Redis 高可用架构解析', desc: '技术研究 / 架构', link: '#knowledge' },
  { title: '第一性原理分析法', desc: '思维方法 / 决策', link: '#knowledge' },
  { title: '用户体验地图绘制指南', desc: '产品思维 / 设计', link: '#knowledge' },
  { title: '从「做完」到「做好」：工程质量的思维转变', desc: '心得 / 技术', link: 'article.html?id=example' },
  { title: '反脆弱：如何从不确定性中获益', desc: '心得 / 认知', link: '#insights' },
  { title: '数据驱动 vs 直觉驱动', desc: '心得 / 数据分析', link: '#insights' }
];

function openSearch() {
  searchOverlay.classList.add('active');
  searchInput.value = '';
  renderSearchResults([]);
  setTimeout(() => searchInput.focus(), 50);
}

function closeSearch() {
  searchOverlay.classList.remove('active');
  searchInput.blur();
}

openSearchBtn?.addEventListener('click', openSearch);
heroSearchBtn?.addEventListener('click', openSearch);

searchOverlay?.addEventListener('click', (e) => {
  if (e.target === searchOverlay) closeSearch();
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
  if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
    closeSearch();
  }
});

let selectedSearchIdx = -1;
searchInput?.addEventListener('input', (e) => {
  const val = e.target.value.trim().toLowerCase();
  if (!val) {
    renderSearchResults([]);
    return;
  }
  const filtered = searchData.filter(item => 
    item.title.toLowerCase().includes(val) || item.desc.toLowerCase().includes(val)
  );
  renderSearchResults(filtered, val);
});

searchInput?.addEventListener('keydown', (e) => {
  const items = searchResults.querySelectorAll('.search-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSearchIdx = (selectedSearchIdx + 1) % items.length;
    updateSearchSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSearchIdx = (selectedSearchIdx - 1 + items.length) % items.length;
    updateSearchSelection(items);
  } else if (e.key === 'Enter' && selectedSearchIdx >= 0) {
    e.preventDefault();
    items[selectedSearchIdx].click();
  }
});

function updateSearchSelection(items) {
  items.forEach((item, idx) => {
    if (idx === selectedSearchIdx) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

function renderSearchResults(results, query = '') {
  selectedSearchIdx = -1;
  if (!query) {
    searchResults.innerHTML = '<div class="search-empty">请输入关键词搜索内容...</div>';
    return;
  }
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
    return;
  }

  searchResults.innerHTML = results.map((item, idx) => {
    // simple highlight
    const regex = new RegExp(`(${query})`, 'gi');
    const highlightedTitle = item.title.replace(regex, '<span class="highlight">$1</span>');
    
    return `
      <div class="search-item ${idx === 0 ? 'selected' : ''}" onclick="window.location.href='${item.link}'; closeSearch()">
        <div class="search-item-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> ${highlightedTitle}</div>
        <div class="search-item-desc">${item.desc}</div>
      </div>
    `;
  }).join('');
  if(results.length > 0) selectedSearchIdx = 0;
}


// ===== ANIMATE STATS =====
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start;
    if (start >= target) clearInterval(timer);
  }, 16);
}

const statNums = document.querySelectorAll('.d-stat-val');
let statsAnimated = false;
function tryAnimateStats() {
  if (statsAnimated) return;
  const hero = document.querySelector('.hero');
  if(!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    statsAnimated = true;
    statNums.forEach(el => animateCounter(el, parseInt(el.dataset.target)));
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

// ===== FILTER TABS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const knowledgeCards = document.querySelectorAll('.knowledge-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    knowledgeCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ===== EXPAND CARDS =====
knowledgeCards.forEach(card => {
  card.addEventListener('click', () => {
    const isExpanded = card.classList.contains('expanded');
    // close others
    knowledgeCards.forEach(c => c.classList.remove('expanded'));
    if (!isExpanded) card.classList.add('expanded');
  });
});

const tlCards = document.querySelectorAll('.timeline-item');
tlCards.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('expanded');
  });
});

// ===== RADAR CHART =====
function drawRadar() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const R = 110;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  const labels = ['系统设计','后端开发','产品思维','数据分析','技术写作','团队协作'];
  const values = [0.85, 0.92, 0.75, 0.68, 0.78, 0.88];
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;

  ctx.clearRect(0,0, canvas.width, canvas.height);

  // bg rings
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
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
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
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
  ctx.strokeStyle = isDark ? 'rgba(168,85,247,0.8)' : 'rgba(109,40,217,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // dots
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + Math.cos(angle) * R * values[i];
    const y = cy + Math.sin(angle) * R * values[i];
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#a855f7' : '#6d28d9';
    ctx.fill();
  }

  // labels
  ctx.font = '13px Outfit, "Noto Sans SC", sans-serif';
  ctx.fillStyle = isDark ? 'rgba(200,200,220,0.85)' : '#475569';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const lx = cx + Math.cos(angle) * (R + 30);
    const ly = cy + Math.sin(angle) * (R + 30);
    ctx.fillText(labels[i], lx, ly);
  }
}

const radarWrap = document.querySelector('.skills-radar-wrap');
if (radarWrap) {
  window.radarObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      drawRadar();
      window.radarObs.disconnect();
    }
  }, { threshold: 0.3 });
  window.radarObs.observe(radarWrap);
}

// ===== MOBILE NAV =====
document.getElementById('navToggle')?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '64px';
  links.style.left = '0'; links.style.right = '0';
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  links.style.background = isDark ? 'rgba(8,8,16,0.95)' : 'rgba(255,255,255,0.95)';
  links.style.padding = '16px 24px 24px';
  links.style.backdropFilter = 'blur(20px)';
  links.style.borderBottom = '1px solid var(--border)';
});

// ===== SIDE TOC HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const tocItems = document.querySelectorAll('.toc-item');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 300) current = s.id;
  });
  
  if(window.scrollY < 300) current = 'hero';

  tocItems.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) {
      a.classList.add('active');
    }
  });
});
