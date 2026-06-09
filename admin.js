/* =====================================================
   INSPIRE — admin.js
===================================================== */

const ADMIN_FB_KEY  = 'inspire_admin_feedback';
const KPI_KEY       = 'inspire_kpi_items';
const TASK_KEY      = 'inspire_tasks';
const PROJ_KEY      = 'inspire_projects';
const KPI_FB_KEY    = 'inspire_kpi_feedback';

/* ── 팀 멤버 정의 ───────────────────────────────── */
const TEAM_MEMBERS = [
  { id:'m1', name:'손대훈',  role:'Control Supervisor', color:'#7c3aed', initials:'DH' },
  { id:'m2', name:'김아무개',role:'Security Officer',   color:'#2563eb', initials:'김A' },
  { id:'m3', name:'이담당',  role:'Security Officer',   color:'#0f766e', initials:'이D' },
  { id:'m4', name:'박야간',  role:'Night Shift Officer', color:'#b45309', initials:'박Y' },
];

/* ── 헬퍼 ──────────────────────────────────────── */
function pctColor(p){ return p>=80?'#16a34a':p>=50?'#2563eb':p>=30?'#d97706':'#dc2626'; }
function daysLeft(d){ if(!d) return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function formatDate(d){ return d?d.replace(/-/g,'.'):''; }
function timeAgo(ts){
  const diff=Date.now()-new Date(ts).getTime();
  const m=Math.floor(diff/60000),h=Math.floor(m/60),dd=Math.floor(h/24);
  if(dd>0)return `${dd}일 전`; if(h>0)return `${h}시간 전`; if(m>0)return `${m}분 전`; return '방금';
}
function memberColor(name){
  const COLORS=['#2563eb','#7c3aed','#0f766e','#b45309','#dc2626','#16a34a'];
  let h=0; for(let c of name) h+=c.charCodeAt(0); return COLORS[h%COLORS.length];
}
function initials(name){ return name?name.slice(0,2):'?'; }
function ratingLabel(r){ return {excellent:'우수 ⭐⭐⭐',good:'양호 ⭐⭐',needs_improvement:'개선 필요 ⭐'}[r]||r; }
function ratingClass(r){ return {excellent:'rating-excellent',good:'rating-good',needs_improvement:'rating-needs'}[r]||'rating-good'; }
function actionLabel(a){ return {approve:'승인',request_revision:'수정 요청',reject:'반려',comment:'코멘트'}[a]||a; }
function actionClass(a){ return {approve:'action-approved',request_revision:'action-revision',reject:'action-rejected',comment:'action-comment'}[a]||'action-comment'; }

/* ── 데이터 로드 ────────────────────────────────── */
function loadKPIs()     { try{ return JSON.parse(localStorage.getItem(KPI_KEY)||'[]'); }catch{ return []; } }
function loadTasks()    { try{ return JSON.parse(localStorage.getItem(TASK_KEY)||'[]'); }catch{ return []; } }
function loadProjects() { try{ return JSON.parse(localStorage.getItem(PROJ_KEY)||'[]'); }catch{ return []; } }
function loadKPIFB()    { try{ return JSON.parse(localStorage.getItem(KPI_FB_KEY)||'{}'); }catch{ return {}; } }
function loadAdminFB()  { try{ return JSON.parse(localStorage.getItem(ADMIN_FB_KEY)||'[]'); }catch{ return []; } }
function saveAdminFB(d) { localStorage.setItem(ADMIN_FB_KEY, JSON.stringify(d)); }

/* ── 멤버별 KPI 평균 달성률 ─────────────────────── */
function memberKPIAvg(memberName){
  const kpis = loadKPIs().filter(k=>k.members&&k.members.includes(memberName)&&k.target>0);
  if(!kpis.length) return 0;
  return Math.round(kpis.reduce((s,k)=>s+Math.min(100,Math.round((k.current/k.target)*100)),0)/kpis.length);
}

/* ── State ──────────────────────────────────────── */
let currentDrawerMember = null;
let currentDrawerTab    = 'kpi';
let fbTargetItem        = null;
let fbTargetType        = null;

/* ── Render All ─────────────────────────────────── */
function renderAll(){
  renderTeamSummary();
  renderKPIChart();
  renderStatusDist();
  renderRecentFeedback();
  renderMemberCards();
  document.getElementById('sbMemberCount').textContent = TEAM_MEMBERS.length;
  populateMemberFilter();
}

/* ── Team Summary Strip ─────────────────────────── */
function renderTeamSummary(){
  const kpis  = loadKPIs();
  const tasks = loadTasks();
  const projs = loadProjects();
  const kpiFBs= loadKPIFB();
  const adminFBs = loadAdminFB();

  const avgKPI = kpis.filter(k=>k.target>0).length
    ? Math.round(kpis.filter(k=>k.target>0).reduce((s,k)=>s+Math.min(100,Math.round(k.current/k.target*100)),0)/kpis.filter(k=>k.target>0).length)
    : 0;
  const allFBCount = Object.values(kpiFBs).reduce((s,arr)=>s+(arr||[]).length,0) + adminFBs.length;

  const defs = [
    { ic:'ti-users',          cls:'purple', label:'팀 인원',          val: TEAM_MEMBERS.length+'명' },
    { ic:'ti-target',         cls:'blue',   label:'KPI 평균 달성률',   val: avgKPI+'%' },
    { ic:'ti-checkbox',       cls:'green',  label:'전체 Task',         val: tasks.length+'건' },
    { ic:'ti-layout-kanban',  cls:'amber',  label:'진행중 프로젝트',    val: projs.filter(p=>p.status==='inprogress').length+'개' },
    { ic:'ti-message-circle', cls:'blue',   label:'피드백 총계',        val: allFBCount+'건' },
    { ic:'ti-circle-check',   cls:'green',  label:'완료 Task',          val: tasks.filter(t=>t.status==='done').length+'건' },
  ];
  document.getElementById('teamSummary').innerHTML = defs.map(d=>`
    <div class="ts-card">
      <div class="ts-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div><div class="ts-label">${d.label}</div><div class="ts-val">${d.val}</div></div>
    </div>`).join('');
}

/* ── KPI 도넛 차트 ──────────────────────────────── */
function renderKPIChart(){
  const kpis  = loadKPIs();
  const area  = document.getElementById('kpiDonutArea');
  const badge = document.getElementById('kpiTotalBadge');
  if(badge) badge.textContent = kpis.length;

  const STATUS = {
    before:     { label:'시작전', color:'#94a3b8' },
    inprogress: { label:'진행중', color:'#2563eb' },
    review:     { label:'검토중', color:'#d97706' },
    done:       { label:'완료',   color:'#16a34a' },
    rejected:   { label:'반려',   color:'#dc2626' },
  };
  const counts = { before:0, inprogress:0, review:0, done:0, rejected:0 };
  kpis.forEach(k=>{ if(counts[k.status]!==undefined) counts[k.status]++; });
  const total = kpis.length || 1;

  // SVG 도넛 계산
  const R = 52, cx = 60, cy = 60;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const segs = Object.entries(STATUS).map(([key, cfg])=>{
    const count = counts[key];
    const dash  = (count / total) * circ;
    const seg   = count > 0
      ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none"
           stroke="${cfg.color}" stroke-width="16"
           stroke-dasharray="${dash} ${circ - dash}"
           stroke-dashoffset="${-offset}"
           style="transition:stroke-dashoffset .6s;"/>`
      : '';
    offset += dash;
    return seg;
  }).join('');

  const svgHTML = `
    <div class="donut-svg-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg);">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--gray-bg)" stroke-width="16"/>
        ${segs}
      </svg>
      <div class="donut-center">
        <div class="donut-center-val">${total}</div>
        <div class="donut-center-label">전체 KPI</div>
      </div>
    </div>`;

  const legendHTML = `
    <div class="donut-legend">
      ${Object.entries(STATUS).map(([key, cfg])=>`
        <div class="donut-leg-item">
          <div class="donut-leg-dot" style="background:${cfg.color};"></div>
          <span class="donut-leg-label">${cfg.label}</span>
          <span class="donut-leg-count">${counts[key]}</span>
          <span class="donut-leg-pct">(${total?Math.round(counts[key]/total*100):0}%)</span>
        </div>`).join('')}
    </div>`;

  area.innerHTML = svgHTML + legendHTML;
}

/* ── Project 항목별 진행률 바 차트 ────────────── */
function renderStatusDist(){
  const projs = loadProjects();
  const area  = document.getElementById('projBarArea');
  const badge = document.getElementById('projTotalBadge');
  if(badge) badge.textContent = projs.length;

  const ST_COLOR = { planning:'#94a3b8', inprogress:'#2563eb', review:'#d97706', done:'#16a34a', hold:'#dc2626' };
  const ST_LABEL = { planning:'기획중', inprogress:'진행중', review:'검토중', done:'완료', hold:'보류' };

  if(!projs.length){
    area.innerHTML='<div class="feed-empty" style="padding:28px;"><i class="ti ti-layout-kanban" style="font-size:24px;display:block;color:var(--card-border);margin-bottom:6px;text-align:center;"></i><p style="text-align:center;font-size:11px;">프로젝트 없음</p></div>';
    return;
  }

  area.innerHTML = projs.map(p=>{
    const pct = p.progress||0;
    const col = pctColor(pct);
    const stColor = ST_COLOR[p.status]||'#94a3b8';
    const stLabel = ST_LABEL[p.status]||p.status;
    return `
      <div class="pb-row">
        <div class="pb-name" title="${p.title}">${p.title}</div>
        <div class="pb-wrap">
          <div class="pb-bar-row">
            <div class="pb-track">
              <div class="pb-fill" style="width:${pct}%;background:${col};"></div>
            </div>
            <div class="pb-pct" style="color:${col};">${pct}%</div>
          </div>
          <div class="pb-status">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${stColor};margin-right:3px;vertical-align:middle;"></span>${stLabel}
            ${p.owner?`· ${p.owner}`:''}
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── Task 일별 현황 바 차트 ─────────────────────── */
function renderTaskDailyChart(){
  const tasks = loadTasks();
  const area  = document.getElementById('taskBarChartArea');
  const badge = document.getElementById('taskTotalBadge');
  if(badge) badge.textContent = tasks.length+'건';

  // 최근 14일
  const days = [];
  for(let i=13;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    days.push(d.toISOString().slice(0,10));
  }

  // 날짜별 집계 (createdAt=진행, status=done이면 완료로 가정)
  const dayData = days.map(date=>{
    const created = tasks.filter(t=>t.createdAt===date).length;
    const done    = tasks.filter(t=>t.status==='done'&&t.createdAt===date).length;
    return { date, created, done };
  });

  const maxVal = Math.max(...dayData.map(d=>d.created), 1);
  const barH   = 90;

  // 범례
  const legend = document.getElementById('taskChartLegend');
  if(legend) legend.innerHTML = `
    <div class="tc-leg-item"><div class="tc-leg-dot" style="background:#2563eb;"></div>접수</div>
    <div class="tc-leg-item"><div class="tc-leg-dot" style="background:#16a34a;"></div>완료</div>`;

  area.innerHTML = dayData.map(d=>{
    const createdH = Math.round((d.created/maxVal)*barH);
    const doneH    = Math.round((d.done/maxVal)*barH);
    const label    = d.date.slice(5).replace('-','/'); // MM/DD
    const isToday  = d.date === new Date().toISOString().slice(0,10);
    return `
      <div class="tbc-col">
        <div class="tbc-bars">
          <div class="tbc-bar" style="height:${createdH||2}px;background:${isToday?'#1d4ed8':'#2563eb'};opacity:${isToday?1:.75};" title="${d.date} 접수 ${d.created}건"></div>
          <div class="tbc-bar" style="height:${doneH||2}px;background:${isToday?'#15803d':'#16a34a'};opacity:${isToday?1:.75};" title="${d.date} 완료 ${d.done}건"></div>
        </div>
        <div class="tbc-date" style="${isToday?'color:var(--sb-active);font-weight:500;':''}">${label}</div>
      </div>`;
  }).join('');
}

/* ── Recent Feedback ────────────────────────────── */
function renderRecentFeedback(){
  const kpiFBs   = loadKPIFB();
  const adminFBs = loadAdminFB();
  const all = [];

  Object.entries(kpiFBs).forEach(([kpiId, fbs])=>{
    const kpi = loadKPIs().find(k=>k.id===kpiId);
    (fbs||[]).forEach(f=>all.push({...f, kpiTitle:kpi?.title||'KPI', type:'kpi'}));
  });
  adminFBs.forEach(f=>all.push(f));
  all.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const top = all.slice(0,8);

  document.getElementById('recentFbCount').textContent = all.length;
  const area = document.getElementById('recentFbArea');
  if(!top.length){
    area.innerHTML='<div class="feed-empty"><i class="ti ti-message-off"></i>피드백 없음</div>'; return;
  }
  area.innerHTML = top.map(f=>`
    <div class="fb-feed-item">
      <div class="fb-av" style="background:${memberColor(f.author||'관리자')}">${initials(f.author||'관')}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;flex-wrap:wrap;">
          <span class="fb-author">${f.author||'관리자'}</span>
          <span class="fb-role-badge ${f.role==='supervisor'?'fb-role-supervisor':'fb-role-manager'}">${f.role==='supervisor'?'Supervisor':'Manager'}</span>
          ${f.rating?`<span class="${ratingClass(f.rating)} rating-badge">${ratingLabel(f.rating)}</span>`:''}
        </div>
        <div class="fb-kpi-nm">${f.kpiTitle||f.projTitle||f.taskTitle||''}</div>
        <div class="fb-text">${f.text}</div>
        <div class="fb-time">${timeAgo(f.ts)}</div>
      </div>
    </div>`).join('');
}

/* ── Member Filter 초기화 ───────────────────────── */
function populateMemberFilter(){
  const sel = document.getElementById('memberFilter');
  if(sel.options.length > 1) return;
  TEAM_MEMBERS.forEach(m=>{
    const opt=document.createElement('option');
    opt.value=m.name; opt.textContent=m.name;
    sel.appendChild(opt);
  });
}

/* ── Member Cards ───────────────────────────────── */
function renderMemberCards(){
  const q     = (document.getElementById('adminSearch')?.value||'').toLowerCase();
  const mf    = document.getElementById('memberFilter')?.value||'all';
  const sort  = document.getElementById('sortFilter')?.value||'name';
  const tasks = loadTasks();
  const projs = loadProjects();
  const kpis  = loadKPIs();

  let members = TEAM_MEMBERS.filter(m=>{
    if(mf!=='all' && m.name!==mf) return false;
    if(q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });

  members = [...members].sort((a,b)=>{
    if(sort==='kpi')  return memberKPIAvg(b.name) - memberKPIAvg(a.name);
    if(sort==='task') return tasks.filter(t=>t.assignee===b.name).length - tasks.filter(t=>t.assignee===a.name).length;
    return a.name.localeCompare(b.name,'ko');
  });

  document.getElementById('memberGrid').innerHTML = members.map(m=>{
    const mTasks = tasks.filter(t=>t.assignee===m.name);
    const mProjs = projs.filter(p=>(p.members||[]).includes(m.name));
    const mKPIs  = kpis.filter(k=>(k.members||[]).includes(m.name));
    const avgKPI = memberKPIAvg(m.name);
    const kpiCol = pctColor(avgKPI);
    const doneTasks = mTasks.filter(t=>t.status==='done').length;
    const activeProjs = mProjs.filter(p=>p.status==='inprogress').length;
    const kpiFBCount = Object.values(loadKPIFB()).reduce((s,arr)=>{
      return s + (arr||[]).filter(f=>mKPIs.some(k=>k.id)).length;
    }, 0);

    return `
      <div class="member-card" onclick="openDrawer('${m.id}')">
        <div class="mc-top">
          <div class="mc-av" style="background:${m.color}">${m.initials}</div>
          <div style="flex:1;min-width:0;">
            <div class="mc-name">${m.name}</div>
            <div class="mc-role">${m.role}</div>
          </div>
          <div class="mc-badges">
            ${mKPIs.filter(k=>k.status==='review').length?`<span class="mc-badge" style="background:var(--warn-bg);color:var(--warn-t);border-color:var(--warn-b);">검토 ${mKPIs.filter(k=>k.status==='review').length}</span>`:''}
            ${mTasks.filter(t=>{ const dl=daysLeft(t.due); return dl!==null&&dl<=1&&t.status!=='done'; }).length?`<span class="mc-badge" style="background:var(--danger-bg);color:var(--danger-t);border-color:var(--danger-b);">마감임박</span>`:''}
          </div>
        </div>

        <div class="mc-stats">
          <div class="mc-stat">
            <div class="mc-stat-val">${mKPIs.length}</div>
            <div class="mc-stat-label">KPI</div>
          </div>
          <div class="mc-stat">
            <div class="mc-stat-val">${mTasks.length}</div>
            <div class="mc-stat-label">Task</div>
          </div>
          <div class="mc-stat">
            <div class="mc-stat-val">${mProjs.length}</div>
            <div class="mc-stat-label">Project</div>
          </div>
        </div>

        <div class="mc-kpi">
          <div class="mc-kpi-top">
            <span class="mc-kpi-label">KPI 평균 달성률</span>
            <span class="mc-kpi-pct" style="color:${kpiCol}">${avgKPI}%</span>
          </div>
          <div class="mc-kpi-track">
            <div class="mc-kpi-fill" style="width:${avgKPI}%;background:${kpiCol};"></div>
          </div>
        </div>

        <div class="mc-footer">
          <span>완료 Task ${doneTasks}/${mTasks.length} · 진행 프로젝트 ${activeProjs}개</span>
          <span class="mc-footer-action"><i class="ti ti-chevron-right"></i>상세보기</span>
        </div>
      </div>`;
  }).join('');
}

/* ── Drawer ─────────────────────────────────────── */
function openDrawer(memberId){
  currentDrawerMember = TEAM_MEMBERS.find(m=>m.id===memberId);
  if(!currentDrawerMember) return;
  currentDrawerTab = 'kpi';
  renderDrawerHeader();
  switchDrawerTab('kpi');
  document.getElementById('drawerBackdrop').classList.add('open');
  document.getElementById('drawer').classList.add('open');
}
function closeDrawer(){
  document.getElementById('drawerBackdrop').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  currentDrawerMember = null;
}
function renderDrawerHeader(){
  const m = currentDrawerMember;
  document.getElementById('drawerMemberInfo').innerHTML = `
    <div class="drawer-av" style="background:${m.color}">${m.initials}</div>
    <div>
      <div class="drawer-name">${m.name}</div>
      <div class="drawer-role">${m.role}</div>
    </div>`;
}
function switchDrawerTab(tab){
  currentDrawerTab = tab;
  document.querySelectorAll('.drawer-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  if(tab==='kpi')     renderDrawerKPI();
  else if(tab==='task')    renderDrawerTask();
  else if(tab==='project') renderDrawerProject();
}

/* ── Drawer KPI Tab ─────────────────────────────── */
function renderDrawerKPI(){
  const m    = currentDrawerMember;
  const kpis = loadKPIs().filter(k=>(k.members||[]).includes(m.name));
  const kpiFBs = loadKPIFB();
  const body = document.getElementById('drawerBody');

  if(!kpis.length){
    body.innerHTML='<div class="feed-empty"><i class="ti ti-target"></i><p>'+m.name+'의 KPI 항목이 없습니다.</p></div>'; return;
  }

  const kpiStatusLabel = {before:'시작전',inprogress:'진행중',review:'검토중',done:'완료',rejected:'반려'};
  const kpiStatusClass = {before:'kpi-st-before',inprogress:'kpi-st-inprogress',review:'kpi-st-review',done:'kpi-st-done',rejected:'kpi-st-rejected'};

  body.innerHTML = kpis.map(k=>{
    const pct = k.target>0?Math.min(100,Math.round(k.current/k.target*100)):0;
    const col = pctColor(pct);
    const fbs = kpiFBs[k.id]||[];
    const fbsHTML = fbs.length ? `
      <div class="fb-thread">
        ${fbs.slice(-3).reverse().map(f=>`
          <div class="fb-bubble">
            <div class="fb-b-av" style="background:${memberColor(f.author||'관')};">${initials(f.author||'관')}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
                <span class="fb-b-name">${f.author}</span>
                ${f.rating?`<span class="${ratingClass(f.rating)} rating-badge">${ratingLabel(f.rating)}</span>`:''}
                ${f.action&&f.action!=='comment'?`<span class="${actionClass(f.action)} rating-badge">${actionLabel(f.action)}</span>`:''}
                <span class="fb-b-time" style="margin-left:auto;">${timeAgo(f.ts)}</span>
              </div>
              <div class="fb-b-text">${f.text}</div>
            </div>
          </div>`).join('')}
      </div>` : '<div style="font-size:11px;color:var(--text-sec);">피드백 없음</div>';

    return `
      <div class="drawer-item">
        <div class="di-top">
          <div class="di-title">${k.title}</div>
          <div class="di-badges">
            <span class="status-badge ${kpiStatusClass[k.status]||'kpi-st-before'}" style="font-size:9px;padding:2px 7px;">${kpiStatusLabel[k.status]||k.status}</span>
          </div>
        </div>
        ${k.desc?`<div style="font-size:11px;color:var(--text-sec);line-height:1.5;">${k.desc}</div>`:''}
        <div class="di-meta">
          ${k.metric?`<div class="di-meta-item"><i class="ti ti-chart-bar"></i>${k.metric}</div>`:''}
          ${k.target?`<div class="di-meta-item"><i class="ti ti-target"></i>목표 ${k.target}</div>`:''}
          ${k.dueDate?`<div class="di-meta-item"><i class="ti ti-calendar-due"></i>${formatDate(k.dueDate)}</div>`:''}
        </div>
        ${k.target>0?`
        <div class="di-progress">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="font-size:10px;color:var(--text-sec);">진행률</span>
            <span style="font-size:11px;font-weight:500;color:${col};">${pct}%</span>
          </div>
          <div class="di-track"><div class="di-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>`:''}
        <div class="drawer-section-title" style="margin-top:4px;">피드백</div>
        ${fbsHTML}
        <div class="di-actions">
          <button class="di-action-btn btn-feedback" onclick="openFbModal('kpi','${k.id}','${k.title}')">
            <i class="ti ti-message-plus"></i> 피드백 작성
          </button>
          <button class="di-action-btn btn-approve" onclick="quickAction('kpi','${k.id}','approve')">
            <i class="ti ti-check"></i> 승인
          </button>
          <button class="di-action-btn btn-revision" onclick="quickAction('kpi','${k.id}','request_revision')">
            <i class="ti ti-edit"></i> 수정 요청
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ── Drawer Task Tab ────────────────────────────── */
function renderDrawerTask(){
  const m     = currentDrawerMember;
  const tasks = loadTasks().filter(t=>t.assignee===m.name);
  const body  = document.getElementById('drawerBody');
  const stLabel = {todo:'할 일',doing:'진행중',review:'검토중',done:'완료',hold:'보류'};
  const stClass = {todo:'st-todo',doing:'st-doing',review:'st-review',done:'st-done',hold:'st-hold'};
  const priLabel= {high:'높음',mid:'중간',low:'낮음'};
  const priClass= {high:'pri-high',mid:'pri-mid',low:'pri-low'};

  if(!tasks.length){
    body.innerHTML='<div class="feed-empty"><i class="ti ti-checkbox"></i><p>'+m.name+'의 Task가 없습니다.</p></div>'; return;
  }
  body.innerHTML = tasks.map(t=>{
    const dl  = daysLeft(t.due);
    const dlTxt = dl===null?'':dl<0?`<span style="color:#dc2626;">${Math.abs(dl)}일 초과</span>`:dl===0?`<span style="color:#dc2626;">오늘 마감</span>`:`D-${dl}`;
    const cl  = t.checklist&&t.checklist.length?{ done:t.checklist.filter(c=>c.done).length, total:t.checklist.length }:null;
    return `
      <div class="drawer-item">
        <div class="di-top">
          <div class="di-title">${t.title}</div>
          <div class="di-badges">
            <span class="status-badge ${stClass[t.status]||'st-todo'}" style="font-size:9px;padding:2px 7px;">${stLabel[t.status]||t.status}</span>
            <span class="pri-badge ${priClass[t.priority]||'pri-mid'}">${priLabel[t.priority]||'중간'}</span>
          </div>
        </div>
        ${t.desc?`<div style="font-size:11px;color:var(--text-sec);line-height:1.5;">${t.desc}</div>`:''}
        <div class="di-meta">
          ${t.due?`<div class="di-meta-item"><i class="ti ti-calendar-due"></i>${formatDate(t.due)} ${dlTxt}</div>`:''}
          ${t.tags&&t.tags.length?`<div class="di-meta-item"><i class="ti ti-tag"></i>${t.tags.join(', ')}</div>`:''}
          ${t.files&&t.files.length?`<div class="di-meta-item"><i class="ti ti-paperclip"></i>첨부 ${t.files.length}개</div>`:''}
        </div>
        ${cl?`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-sec);">
          <div class="di-track" style="flex:1;"><div class="di-fill" style="width:${Math.round(cl.done/cl.total*100)}%;background:#2563eb;"></div></div>
          체크리스트 ${cl.done}/${cl.total}
        </div>`:''}
        ${t.memo?`<div style="font-size:11px;color:var(--text-sec);padding:6px 9px;background:var(--gray-bg);border-radius:6px;">📝 ${t.memo}</div>`:''}
        <div class="di-actions">
          <button class="di-action-btn btn-approve"  onclick="changeStatus('task','${t.id}','done')"><i class="ti ti-check"></i> 완료 처리</button>
          <button class="di-action-btn btn-revision" onclick="changeStatus('task','${t.id}','review')"><i class="ti ti-eye"></i> 검토중</button>
          <button class="di-action-btn btn-feedback" onclick="openFbModal('task','${t.id}','${t.title}')"><i class="ti ti-message-plus"></i> 피드백</button>
        </div>
      </div>`;
  }).join('');
}

/* ── Drawer Project Tab ─────────────────────────── */
function renderDrawerProject(){
  const m    = currentDrawerMember;
  const projs= loadProjects().filter(p=>(p.members||[]).includes(m.name));
  const body = document.getElementById('drawerBody');
  const stLabel= {planning:'기획중',inprogress:'진행중',review:'검토중',done:'완료',hold:'보류'};
  const stClass= {planning:'st-planning',inprogress:'st-inprogress',review:'st-review',done:'st-done',hold:'st-hold'};
  const priLabel= {high:'높음',mid:'중간',low:'낮음'};
  const priClass= {high:'pri-high',mid:'pri-mid',low:'pri-low'};

  if(!projs.length){
    body.innerHTML='<div class="feed-empty"><i class="ti ti-layout-kanban"></i><p>'+m.name+'의 프로젝트가 없습니다.</p></div>'; return;
  }
  body.innerHTML = projs.map(p=>{
    const pct = p.progress||0;
    const col = pctColor(pct);
    const cl  = p.checklist&&p.checklist.length?{ done:p.checklist.filter(c=>c.done).length, total:p.checklist.length }:null;
    const dl  = daysLeft(p.end);
    const dlTxt = dl===null?'':dl<0?`<span style="color:#dc2626;">${Math.abs(dl)}일 초과</span>`:dl===0?'오늘 마감':`D-${dl}`;
    return `
      <div class="drawer-item">
        <div class="di-top">
          <div class="di-title">${p.title}</div>
          <div class="di-badges">
            <span class="status-badge ${stClass[p.status]||'st-planning'}" style="font-size:9px;padding:2px 7px;">${stLabel[p.status]||p.status}</span>
            <span class="pri-badge ${priClass[p.priority]||'pri-mid'}">${priLabel[p.priority]||'중간'}</span>
          </div>
        </div>
        ${p.desc?`<div style="font-size:11px;color:var(--text-sec);line-height:1.5;">${p.desc}</div>`:''}
        <div class="di-meta">
          ${p.start?`<div class="di-meta-item"><i class="ti ti-calendar"></i>${formatDate(p.start)}</div>`:''}
          ${p.end?`<div class="di-meta-item"><i class="ti ti-calendar-due"></i>${formatDate(p.end)} ${dlTxt}</div>`:''}
          ${p.members&&p.members.length?`<div class="di-meta-item"><i class="ti ti-users"></i>${p.members.join(', ')}</div>`:''}
          ${p.files&&p.files.length?`<div class="di-meta-item"><i class="ti ti-paperclip"></i>첨부 ${p.files.length}개</div>`:''}
        </div>
        <div class="di-progress">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="font-size:10px;color:var(--text-sec);">진행률</span>
            <span style="font-size:11px;font-weight:500;color:${col};">${pct}%</span>
          </div>
          <div class="di-track"><div class="di-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>
        ${cl?`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text-sec);">
          <div class="di-track" style="flex:1;"><div class="di-fill" style="width:${Math.round(cl.done/cl.total*100)}%;background:#2563eb;"></div></div>
          마일스톤 ${cl.done}/${cl.total}
        </div>`:''}
        ${p.memo?`<div style="font-size:11px;color:var(--text-sec);padding:6px 9px;background:var(--gray-bg);border-radius:6px;">📝 ${p.memo}</div>`:''}
        <div class="di-actions">
          <button class="di-action-btn btn-approve"  onclick="changeProjStatus('${p.id}','done')"><i class="ti ti-check"></i> 완료 승인</button>
          <button class="di-action-btn btn-revision" onclick="changeProjStatus('${p.id}','review')"><i class="ti ti-eye"></i> 검토중</button>
          <button class="di-action-btn btn-feedback" onclick="openFbModal('project','${p.id}','${p.title}')"><i class="ti ti-message-plus"></i> 피드백</button>
        </div>
      </div>`;
  }).join('');
}

/* ── Quick Actions ──────────────────────────────── */
function changeStatus(type, id, newStatus){
  if(type==='task'){
    const tasks = loadTasks();
    const idx   = tasks.findIndex(t=>t.id===id);
    if(idx>=0){ tasks[idx].status=newStatus; localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); }
    renderDrawerTask();
  }
  renderAll();
}
function changeProjStatus(id, newStatus){
  const projs = loadProjects();
  const idx   = projs.findIndex(p=>p.id===id);
  if(idx>=0){ projs[idx].status=newStatus; localStorage.setItem(PROJ_KEY, JSON.stringify(projs)); }
  renderDrawerProject(); renderAll();
}
function quickAction(type, id, action){
  openFbModal(type, id, loadKPIs().find(k=>k.id===id)?.title||id);
  document.getElementById('fbAction').value=action;
}

/* ── Feedback Modal ─────────────────────────────── */
function openFbModal(type, id, title){
  fbTargetType = type;
  fbTargetItem = { id, title };
  document.getElementById('fbModalTitle').textContent = `${type==='kpi'?'KPI':type==='task'?'Task':'Project'} 피드백 작성`;
  document.getElementById('fbTargetInfo').textContent = `대상: ${title}`;
  document.getElementById('fbText').value='';
  document.getElementById('fbRating').value='good';
  document.getElementById('fbAction').value='comment';
  document.getElementById('fbBackdrop').classList.add('open');
}
function closeFbModal(e){
  if(e&&e.target!==document.getElementById('fbBackdrop')) return;
  document.getElementById('fbBackdrop').classList.remove('open');
}
function submitFeedback(){
  const text   = document.getElementById('fbText').value.trim();
  if(!text){ alert('피드백 내용을 입력해주세요.'); return; }
  const rating = document.getElementById('fbRating').value;
  const action = document.getElementById('fbAction').value;
  const fb = {
    id:     `afb_${Date.now()}`,
    author: '손대훈',
    role:   'supervisor',
    text, rating, action,
    ts:     new Date().toISOString(),
    kpiTitle:  fbTargetType==='kpi'    ? fbTargetItem.title : undefined,
    taskTitle: fbTargetType==='task'   ? fbTargetItem.title : undefined,
    projTitle: fbTargetType==='project'? fbTargetItem.title : undefined,
  };

  if(fbTargetType==='kpi'){
    const kpiFBs = loadKPIFB();
    if(!kpiFBs[fbTargetItem.id]) kpiFBs[fbTargetItem.id]=[];
    kpiFBs[fbTargetItem.id].push(fb);
    localStorage.setItem(KPI_FB_KEY, JSON.stringify(kpiFBs));
    // KPI 상태 변경 처리
    if(action==='approve'||action==='request_revision'||action==='reject'){
      const kpis = loadKPIs();
      const idx  = kpis.findIndex(k=>k.id===fbTargetItem.id);
      if(idx>=0){
        kpis[idx].status = action==='approve'?'done':action==='reject'?'rejected':'review';
        localStorage.setItem(KPI_KEY, JSON.stringify(kpis));
      }
    }
  } else {
    const adminFBs = loadAdminFB();
    adminFBs.push(fb);
    saveAdminFB(adminFBs);
    // Task/Project 상태 변경
    if(fbTargetType==='task'&&(action==='approve'||action==='request_revision')){
      const tasks=loadTasks(); const idx=tasks.findIndex(t=>t.id===fbTargetItem.id);
      if(idx>=0){ tasks[idx].status=action==='approve'?'done':'review'; localStorage.setItem(TASK_KEY,JSON.stringify(tasks)); }
    }
    if(fbTargetType==='project'&&(action==='approve'||action==='request_revision')){
      const projs=loadProjects(); const idx=projs.findIndex(p=>p.id===fbTargetItem.id);
      if(idx>=0){ projs[idx].status=action==='approve'?'done':'review'; localStorage.setItem(PROJ_KEY,JSON.stringify(projs)); }
    }
  }

  document.getElementById('fbBackdrop').classList.remove('open');
  // 드로어 현재 탭 새로고침
  if(currentDrawerMember) switchDrawerTab(currentDrawerTab);
  renderAll();
  alert('피드백이 제출되었습니다.');
}

/* ── Search ─────────────────────────────────────── */
document.getElementById('adminSearch').addEventListener('input', ()=>renderMemberCards());

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
