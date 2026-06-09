/* =====================================================
   SecureOps Dashboard — app.js
   ===================================================== */

/* ── Dark Mode ─────────────────────────────────────── */
const DARK_KEY = 'secureops_dark';

function setDarkMode(next) {
  const root = document.documentElement;
  const knob = document.getElementById('knob');

  if (next === '1') {
    root.setAttribute('data-dark', '1');
    if (knob) knob.textContent = '☀️';
  } else {
    root.removeAttribute('data-dark');
    if (knob) knob.textContent = '🌙';
  }

  localStorage.setItem(DARK_KEY, next);
}

function toggleDark() {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-dark') === '1';
  setDarkMode(isDark ? '0' : '1');
}

function applyStoredDark() {
  const stored = localStorage.getItem(DARK_KEY);
  setDarkMode(stored === '1' ? '1' : '0');
}


/* ── Sidebar Collapse ──────────────────────────────── */
const SIDEBAR_KEY = 'secureops_sidebar_collapsed';

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const icon = document.getElementById('collapseIcon');
  const isCollapsed = sidebar.classList.toggle('collapsed');

  icon.className = isCollapsed
    ? 'ti ti-layout-sidebar-left-expand'
    : 'ti ti-layout-sidebar-left-collapse';

  localStorage.setItem(SIDEBAR_KEY, isCollapsed ? '1' : '0');
}

function applyStoredSidebar() {
  const stored = localStorage.getItem(SIDEBAR_KEY);
  if (stored === '1') {
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('collapseIcon');
    sidebar.classList.add('collapsed');
    if (icon) icon.className = 'ti ti-layout-sidebar-left-expand';
  }
}


/* ── Sidebar Active Item ───────────────────────────── */
function initSidebarNav() {
  const items = document.querySelectorAll('.sb-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}


/* ── Search ────────────────────────────────────────── */
function initSearch() {
  const input = document.querySelector('.search-wrap input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      alert(`"${input.value.trim()}" 검색 기능은 추후 구현 예정입니다.`);
      input.value = '';
    }
  });
}


/* ── Quick Buttons ─────────────────────────────────── */
function initQuickButtons() {
  const actions = {
    '데일리 로그':  () => alert('데일리 로그 작성 페이지로 이동합니다.'),
    '사건보고서':   () => alert('사건보고서 작성 페이지로 이동합니다.'),
    '인수인계':     () => alert('인수인계 문서 작성 페이지로 이동합니다.'),
    'CCTV 리뷰':    () => alert('CCTV 리뷰 체크리스트 페이지로 이동합니다.'),
  };

  const btns = document.querySelectorAll('.quick-btn');
  btns.forEach(btn => {
    const label = btn.querySelector('span')?.textContent?.trim();
    if (label && actions[label]) {
      btn.addEventListener('click', actions[label]);
    }
  });
}


/* ── List Row Click ────────────────────────────────── */
function initListRows() {
  const rows = document.querySelectorAll('.list-row:not(.handover-note)');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const title = row.querySelector('.row-title')?.textContent;
      if (title) alert(`"${title}" 상세 페이지로 이동합니다.`);
    });
  });
}

/* ── Logout ───────────────────────────────────────── */
function logout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    localStorage.removeItem("currentUser");
    sessionStorage.clear();

    location.href = "login.html";
  }
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyStoredDark();
  applyStoredSidebar();
  initSidebarNav();
  initSearch();
  initQuickButtons();
  initListRows();
});
