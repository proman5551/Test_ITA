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

/* ── Sidebar Menu Render ──────────────────────────── */

const PERSONAL_MENUS = [
  { title: "홈", url: "index.html", icon: "ti-home" },
  { title: "KPI 관리", url: "kpi.html", icon: "ti-target", badge: "3", badgeType: "blue" },
  { title: "Task", url: "task.html", icon: "ti-checkbox", badge: "5", badgeType: "ok" },
  { title: "Project", url: "project.html", icon: "ti-layout-kanban" },
  { title: "메모", url: "memo.html", icon: "ti-notes" }
];

const WORK_MENUS = [
  { title: "사건보고서", url: "incident.html", icon: "ti-file-report", badge: "5", badgeType: "blue" },
  { title: "인수인계", url: "handover.html", icon: "ti-transfer", badge: "2", badgeType: "ok" },
  { title: "데일리 로그", url: "dailylog.html", icon: "ti-clipboard-list" },
  { title: "CCTV Review", url: "cctv.html", icon: "ti-camera" },
  { title: "경찰영장공문", url: "warrant.html", icon: "ti-gavel" }
];

const ADMIN_MENUS = [
  { title: "팀 대시보드", url: "admin.html", icon: "ti-layout-dashboard" },
  { title: "사원 관리", url: "member.html", icon: "ti-users", badge: "0", badgeType: "blue", badgeId: "sbMemberCount" },
  { title: "KPI 현황", url: "admin-kpi.html", icon: "ti-target" },
  { title: "Task 현황", url: "admin-task.html", icon: "ti-checkbox" },
  { title: "Project 현황", url: "admin-project.html", icon: "ti-layout-kanban" },
  { title: "피드백 내역", url: "admin-feedback.html", icon: "ti-message-circle" }
];

const ADMIN_SUB_MENUS = [
  { title: "사원 홈으로", url: "index.html", icon: "ti-arrow-left" },
  { title: "사원 KPI로", url: "kpi.html", icon: "ti-target" }
];

const PAGE_SWITCH_MENUS = [
  {
    title: "사원 페이지",
    url: "index.html",
    icon: "ti-user",
    roles: ["Officer", "Supervisor", "Manager", "Admin"]
  },
  {
    title: "관리자 페이지",
    url: "admin.html",
    icon: "ti-shield-check",
    roles: ["Supervisor", "Manager", "Admin"]
  }
];

/* 메뉴 한 묶음을 HTML로 만들어주는 공통 함수 */
function renderMenu(targetId, menus) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  target.innerHTML = menus.map(menu => {
    const active = menu.url === currentPage ? "active" : "";

    const badge = menu.badge
      ? `<span class="sb-badge ${menu.badgeType || "blue"}" ${menu.badgeId ? `id="${menu.badgeId}"` : ""}>${menu.badge}</span>`
      : "";

    return `
      <a href="${menu.url}" class="sb-item ${active}">
        <i class="ti ${menu.icon}" aria-hidden="true"></i>
        <span>${menu.title}</span>
        ${badge}
      </a>
    `;
  }).join("");
}

/* 사원/관리자 페이지 전환 버튼 생성 */
function renderPageSwitch() {
  const target = document.getElementById("pageSwitchRow");
  if (!target) return;

  const position = localStorage.getItem("position") || "";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const isAdminPage =
    currentPage.startsWith("admin") ||
    currentPage === "member.html";

  const allowedMenus = PAGE_SWITCH_MENUS.filter(menu => {
    return menu.roles.some(role => position.includes(role));
  });

  target.innerHTML = allowedMenus.map(menu => {
    const active = isAdminPage
      ? menu.url === "admin.html"
      : menu.url === "index.html";

    return `
      <button class="page-switch-btn ${active ? "active-page" : ""}"
              onclick="location.href='${menu.url}'">
        <i class="ti ${menu.icon}"></i>
        <span>${menu.title}</span>
      </button>
    `;
  }).join("");
}

/* 현재 페이지에 존재하는 메뉴 영역만 자동 생성 */
function renderAllMenus() {
  renderMenu("personalMenu", PERSONAL_MENUS);
  renderMenu("workMenu", WORK_MENUS);
  renderMenu("adminMenu", ADMIN_MENUS);
  renderMenu("adminSubMenu", ADMIN_SUB_MENUS);
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


/* ── Index Quick Buttons ───────────────────────── */
function initQuickButtons() {
  const actions = {
    "데일리 로그": () => location.href = "dailylog.html",
    "사건보고서": () => location.href = "incident.html",
    "인수인계": () => location.href = "handover.html",
    "CCTV 리뷰": () => location.href = "cctv.html"
  };

  document.querySelectorAll(".quick-btn").forEach(btn => {
    const label = btn.querySelector("span")?.textContent?.trim();
    if (label && actions[label]) {
      btn.addEventListener("click", actions[label]);
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

/* ── Login User Info ──────────────────────────────── */
function makeAvatar(name) {
  if (!name) return "U";

  if (/[가-힣]/.test(name)) {
    return name.slice(-2);
  }

  return name.substring(0, 2).toUpperCase();
}

function loadLoginUserInfo() {
  const employeeId = localStorage.getItem("employeeId");
  const employeeName = localStorage.getItem("employeeName");
  const department = localStorage.getItem("department");
  const position = localStorage.getItem("position");
  const photo = localStorage.getItem("photo");

  if (!employeeId) {
    location.href = "login.html";
    return;
  }

  const nameText = employeeName || employeeId;
  const roleText = position || "Position";
  const deptText = department || "Department";

  const userAvatar = document.getElementById("userAvatar");
  const loginUserName = document.getElementById("loginUserName");
  const loginUserInfo = document.getElementById("loginUserInfo");
  const greetingName = document.getElementById("greetingName");

  if (userAvatar) {

    if (photo && photo !== "") {
      userAvatar.innerHTML =
        `<img src="${photo}" alt="${nameText}">`;
    } else {
      userAvatar.textContent = makeAvatar(nameText);
    }

  }

  if (loginUserName) loginUserName.textContent = nameText;
  if (loginUserInfo) loginUserInfo.textContent = `${deptText} | ${roleText}`;
  if (greetingName) greetingName.textContent = nameText;
}

/* ── Date Time ────────────────────────────────────── */
function updateDateTime() {

  const target = document.getElementById("currentDateTime");
  if (!target) return;

  const now = new Date();

  const week = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일"
  ];

  target.textContent =
    `${now.getFullYear()}년 ` +
    `${now.getMonth() + 1}월 ` +
    `${now.getDate()}일 ` +
    `${week[now.getDay()]} · ` +
    `${String(now.getHours()).padStart(2, '0')}:` +
    `${String(now.getMinutes()).padStart(2, '0')} · ` +
    `Security Control Room`;
}

/* ── Notifications (Global) ───────────────────────── */
const NOTIF_KEY = 'inspire_notifications';
let notifications = [];

const NOTIF_ICONS = {
  overdue:    { icon:'ti-alert-circle',  color:'#dc2626' },
  due_soon:   { icon:'ti-clock',         color:'#d97706' },
  feedback:   { icon:'ti-message-circle',color:'#2563eb' },
  kpi_add:    { icon:'ti-circle-plus',   color:'#16a34a' },
  kpi_done:   { icon:'ti-circle-check',  color:'#16a34a' },
  kpi_status: { icon:'ti-refresh',       color:'#7c3aed' },
};

function timeAgo(ts){
  const diff=Date.now()-new Date(ts).getTime();
  const m=Math.floor(diff/60000), h=Math.floor(m/60), d=Math.floor(h/24);
  if(d>0)return `${d}일 전`; if(h>0)return `${h}시간 전`; if(m>0)return `${m}분 전`; return '방금';
}

function loadNotifStore(){ try{ const r=localStorage.getItem(NOTIF_KEY); return r?JSON.parse(r):[]; }catch{return[];} }
function saveNotifStore(){ localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }

function addNotif(n){
  if(notifications.find(x=>x.id===n.id)) return;
  notifications.unshift(n);
  saveNotifStore();
}

function renderNotifBadge(){
  const cnt = notifications.filter(n=>!n.read).length;
  const badge = document.getElementById('notifBadge');
  if(!badge) return;
  badge.textContent = cnt>9?'9+':cnt;
  badge.style.display = cnt>0?'flex':'none';
}

function renderNotifPanel(){
  const cutoff = Date.now() - 7*86400000;
  const unread = notifications.filter(n=>!n.read);
  const read   = notifications.filter(n=> n.read && new Date(n.ts).getTime()>=cutoff);

  const countEl = document.getElementById('notifUnreadCount');
  if(countEl) countEl.textContent = unread.length;

  const unreadEl = document.getElementById('notifUnread');
  if(unreadEl) unreadEl.innerHTML = unread.length
    ? unread.map(n=>{
        const ic = NOTIF_ICONS[n.type]||{icon:'ti-bell',color:'#94a3b8'};
        return `<div class="notif-item unread" onclick="markNotifRead('${n.id}')">
          <div class="notif-item-icon" style="background:${ic.color}18;color:${ic.color}">
            <i class="ti ${ic.icon}"></i></div>
          <div class="notif-item-body">
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-text">${n.body}</div>
            <div class="notif-item-time">${timeAgo(n.ts)}</div>
          </div>
          <div class="notif-dot"></div>
        </div>`;
      }).join('')
    : '<div class="notif-empty"><i class="ti ti-bell-off"></i>읽지 않은 알림이 없습니다</div>';

  const readEl = document.getElementById('notifRead');
  if(readEl) readEl.innerHTML = read.length
    ? read.map(n=>{
        const ic = NOTIF_ICONS[n.type]||{icon:'ti-bell',color:'#94a3b8'};
        return `<div class="notif-item">
          <div class="notif-item-icon" style="background:var(--sb-hover);color:var(--text-sec)">
            <i class="ti ${ic.icon}"></i></div>
          <div class="notif-item-body">
            <div class="notif-item-title" style="color:var(--text-sec)">${n.title}</div>
            <div class="notif-item-text">${n.body}</div>
            <div class="notif-item-time">${timeAgo(n.ts)}</div>
          </div>
        </div>`;
      }).join('')
    : '<div class="notif-empty"><i class="ti ti-inbox"></i>최근 7일 읽은 알림이 없습니다</div>';

  renderNotifBadge();
}

function markNotifRead(id){
  const n = notifications.find(x=>x.id===id);
  if(n){ n.read=true; saveNotifStore(); renderNotifPanel(); }
}

function markAllNotifRead(){
  notifications.forEach(n=>n.read=true);
  saveNotifStore(); renderNotifPanel();
}

function toggleNotifPanel(){
  const panel   = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if(!panel) return;
  const isOpen = panel.classList.contains('open');
  if(isOpen){
    panel.classList.remove('open');
    overlay.classList.remove('open');
  } else {
    renderNotifPanel();
    panel.classList.add('open');
    overlay.classList.add('open');
  }
}

function closeNotifPanel(){
  const panel   = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if(panel)   panel.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
}

function initNotifSystem(){
  notifications = loadNotifStore();

  if(!document.getElementById('notifPanel')){
    document.body.insertAdjacentHTML('beforeend', `
      <div class="notif-overlay" id="notifOverlay" onclick="closeNotifPanel()"></div>
      <div class="notif-panel" id="notifPanel">
        <div class="notif-panel-header">
          <div class="notif-panel-title">
            <i class="ti ti-bell"></i> 알림
            <span class="notif-panel-count" id="notifUnreadCount">0</span>
          </div>
          <div class="notif-panel-actions">
            <button class="notif-all-read-btn" onclick="markAllNotifRead()">
              <i class="ti ti-checks"></i> 모두 읽음
            </button>
            <button class="notif-close-btn" onclick="closeNotifPanel()">
              <i class="ti ti-x"></i>
            </button>
          </div>
        </div>
        <div class="notif-panel-body">
          <div class="notif-section">
            <div class="notif-section-label">읽지 않은 알림</div>
            <div id="notifUnread"></div>
          </div>
          <div class="notif-divider"></div>
          <div class="notif-section">
            <div class="notif-section-label">최근 7일</div>
            <div id="notifRead"></div>
          </div>
        </div>
      </div>`);
  }

  const bellIcon = document.querySelector('.top-actions .icon-btn .ti-bell');
  if(bellIcon){
    const btn = bellIcon.closest('.icon-btn');
    if(btn && !btn.querySelector('#notifBadge')){
      btn.setAttribute('onclick', 'toggleNotifPanel()');
      btn.style.cssText += ';position:relative;cursor:pointer;';
      btn.insertAdjacentHTML('beforeend', '<span id="notifBadge" class="notif-badge" style="display:none;"></span>');
    }
  }

  renderNotifBadge();
}

/* ── Logout ───────────────────────────────────────── */
function logout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    localStorage.removeItem("employeeId");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("department");
    localStorage.removeItem("position");
    localStorage.removeItem("photo");

    sessionStorage.clear();
    location.href = "login.html";
  }
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadLoginUserInfo();

  applyStoredDark();
  applyStoredSidebar();

  renderAllMenus();
  renderPageSwitch();

  initSearch();
  initQuickButtons();
  initListRows();

  updateDateTime();
  setInterval(updateDateTime, 1000);

  initNotifSystem();
});
