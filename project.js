/* =====================================================
   INSPIRE — project.js
===================================================== */

const PROJ_KEY = 'inspire_projects';

/* ── 초기 샘플 데이터 ─────────────────────────────── */
const INITIAL_PROJECTS = [
  {
    id:'p1', title:'출입통제 시스템 고도화', priority:'high', status:'inprogress',
    start:'2025-05-01', end:'2025-06-30',
    owner:'손대훈', members:['손대훈','김아무개','이담당'],
    tags:['출입통제','시스템'], progress:65,
    desc:'기존 출입통제 시스템의 보안 취약점 보완 및 스마트 인식 기능 도입',
    checklist:[
      {text:'현행 시스템 보안 감사',done:true},
      {text:'신규 장비 선정',done:true},
      {text:'설치 및 테스트',done:false},
      {text:'운영 매뉴얼 작성',done:false},
      {text:'최종 검수',done:false}
    ],
    files:['출입통제_요구사항.pdf','현행분석.xlsx'],
    memo:'예산 승인 완료. 6월 말 완공 목표',
    createdAt:'2025-05-01'
  },
  {
    id:'p2', title:'CCTV 운영 매뉴얼 개정', priority:'mid', status:'review',
    start:'2025-05-15', end:'2025-06-15',
    owner:'이담당', members:['이담당','손대훈'],
    tags:['CCTV','문서'], progress:90,
    desc:'노후 CCTV 운영 지침 전면 개정 및 신규 운영 기준 수립',
    checklist:[
      {text:'현행 매뉴얼 검토',done:true},
      {text:'개정안 초안 작성',done:true},
      {text:'팀내 검토',done:true},
      {text:'최종 승인',done:false}
    ],
    files:['CCTV_매뉴얼_v2.0_초안.docx'],
    memo:'팀장 최종 검토 대기 중',
    createdAt:'2025-05-15'
  },
  {
    id:'p3', title:'비상대응 훈련 계획 수립', priority:'mid', status:'planning',
    start:'2025-06-01', end:'2025-07-31',
    owner:'손대훈', members:['손대훈','김아무개'],
    tags:['훈련','비상대응'], progress:30,
    desc:'연간 비상대응 훈련 시나리오 및 일정 수립. 실전 모의훈련 포함',
    checklist:[
      {text:'훈련 시나리오 작성',done:true},
      {text:'일정 확정',done:false},
      {text:'참여자 공지',done:false},
      {text:'훈련 실시',done:false},
      {text:'결과 보고서 작성',done:false}
    ],
    files:[],
    memo:'7월 셋째 주 훈련 예정',
    createdAt:'2025-06-01'
  },
  {
    id:'p4', title:'보안 구역 재분류 프로젝트', priority:'low', status:'planning',
    start:'2025-07-01', end:'2025-08-31',
    owner:'김아무개', members:['김아무개','손대훈'],
    tags:['보안구역','정책'], progress:0,
    desc:'건물 내 보안 등급 구역 재분류 및 출입 권한 체계 재정립',
    checklist:[
      {text:'현행 구역 현황 파악',done:false},
      {text:'재분류 기준 수립',done:false},
      {text:'구역별 권한 매핑',done:false}
    ],
    files:[],
    memo:'',
    createdAt:'2025-06-05'
  },
  {
    id:'p5', title:'야간 순찰 루트 최적화', priority:'mid', status:'done',
    start:'2025-04-01', end:'2025-05-31',
    owner:'손대훈', members:['손대훈'],
    tags:['순찰','운영'], progress:100,
    desc:'야간 순찰 동선 재설계 및 사각지대 최소화',
    checklist:[
      {text:'현행 루트 분석',done:true},
      {text:'사각지대 식별',done:true},
      {text:'최적 루트 설계',done:true},
      {text:'시범 운영',done:true},
      {text:'최종 확정',done:true}
    ],
    files:['순찰루트_확정본.pdf'],
    memo:'완료 및 현장 적용 중',
    createdAt:'2025-04-01'
  }
];

/* ── 상태 / 우선순위 설정 ──────────────────────────── */
const STATUS_CFG = {
  planning:   { label:'기획중', color:'#94a3b8', colClass:'st-planning',   countBadge:'badge-gray',   bgCls:'gray'  },
  inprogress: { label:'진행중', color:'#2563eb', colClass:'st-inprogress', countBadge:'badge-blue',   bgCls:'blue'  },
  review:     { label:'검토중', color:'#d97706', colClass:'st-review',     countBadge:'badge-warn',   bgCls:'amber' },
  done:       { label:'완료',   color:'#16a34a', colClass:'st-done',       countBadge:'badge-ok',     bgCls:'green' },
  hold:       { label:'보류',   color:'#dc2626', colClass:'st-hold',       countBadge:'badge-danger', bgCls:'red'   },
};
const PRI_CFG = {
  high: { label:'높음', badge:'pri-high', color:'#dc2626' },
  mid:  { label:'중간', badge:'pri-mid',  color:'#d97706' },
  low:  { label:'낮음', badge:'pri-low',  color:'#16a34a' },
};
const MEMBER_COLORS = ['#2563eb','#7c3aed','#0f766e','#b45309','#dc2626','#16a34a'];
function memberColor(name){ let h=0; for(let c of name) h+=c.charCodeAt(0); return MEMBER_COLORS[h%MEMBER_COLORS.length]; }
function memberInitial(name){ return name?name.slice(0,2):'?'; }

/* ── State ─────────────────────────────────────────── */
let projects    = JSON.parse(localStorage.getItem(PROJ_KEY)||'null') || JSON.parse(JSON.stringify(INITIAL_PROJECTS));
let currentView = 'kanban';
let editingCL   = [];
let editingFiles= [];
let deleteTarget= null;

function saveProjects(){ localStorage.setItem(PROJ_KEY, JSON.stringify(projects)); }

/* ── Helpers ────────────────────────────────────────── */
function daysLeft(d){ if(!d) return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function formatDate(d){ return d?d.replace(/-/g,'.'):''; }
function pctColor(p){ return p>=80?'#16a34a':p>=50?'#2563eb':p>=30?'#d97706':'#dc2626'; }
function clProg(cl){ if(!cl||!cl.length) return null; const d=cl.filter(c=>c.done).length; return {done:d,total:cl.length,pct:Math.round(d/cl.length*100)}; }
function filtered(){
  const q   = (document.getElementById('projSearch')?.value||'').toLowerCase();
  const st  = document.getElementById('statusFilter')?.value||'all';
  const pri = document.getElementById('priFilter')?.value||'all';
  return projects.filter(p=>{
    if(st!=='all'  && p.status!==st)       return false;
    if(pri!=='all' && p.priority!==pri)    return false;
    if(q && !p.title.toLowerCase().includes(q) && !(p.members||[]).join('').toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ── View Switch ────────────────────────────────────── */
function switchView(v){
  currentView=v;
  document.getElementById('kanbanView').style.display   = v==='kanban'  ?'flex':'none';
  document.getElementById('timelineView').style.display = v==='timeline'?'block':'none';
  document.getElementById('tabKanban').classList.toggle('active',   v==='kanban');
  document.getElementById('tabTimeline').classList.toggle('active', v==='timeline');
  renderAll();
}

/* ── Render All ─────────────────────────────────────── */
function renderAll(){
  saveProjects();
  renderSummary();
  renderKanban();
  renderTimeline();
  renderRightPanel();
  document.getElementById('sbProjCount').textContent = projects.filter(p=>p.status!=='done').length;
}

/* ── Summary Strip ──────────────────────────────────── */
function renderSummary(){
  const c={planning:0,inprogress:0,review:0,done:0,hold:0};
  projects.forEach(p=>{ if(c[p.status]!==undefined) c[p.status]++; });
  const defs=[
    {key:'planning',  label:'기획중', ic:'ti-bulb',         cls:'gray'},
    {key:'inprogress',label:'진행중', ic:'ti-player-play',  cls:'blue'},
    {key:'review',    label:'검토중', ic:'ti-eye',           cls:'amber'},
    {key:'done',      label:'완료',   ic:'ti-circle-check',  cls:'green'},
    {key:'hold',      label:'보류',   ic:'ti-player-pause',  cls:'red'},
  ];
  document.getElementById('projSummary').innerHTML = defs.map(d=>`
    <div class="ps-card">
      <div class="ps-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div><div class="ps-label">${d.label}</div><div class="ps-val">${c[d.key]}</div></div>
    </div>`).join('');
}

/* ── Kanban ─────────────────────────────────────────── */
function renderKanban(){
  const ft = filtered();
  Object.keys(STATUS_CFG).forEach(status=>{
    const cfg   = STATUS_CFG[status];
    const items = ft.filter(p=>p.status===status);
    const col   = document.getElementById('col-'+status);
    let html = `
      <div class="col-header">
        <div class="col-dot" style="background:${cfg.color}"></div>
        <div class="col-title">${cfg.label}</div>
        <span class="col-count ${cfg.countBadge}">${items.length}</span>
      </div>
      <div class="col-body">`;
    if(!items.length){
      html += `<div class="col-empty"><i class="ti ti-inbox"></i>없음</div>`;
    } else {
      items.forEach(p=>{ html += projCardHTML(p); });
    }
    html += '</div>';
    col.innerHTML = html;
  });
}

function projCardHTML(p){
  const pri  = PRI_CFG[p.priority];
  const pct  = p.progress||0;
  const col  = pctColor(pct);
  const dl   = daysLeft(p.end);
  const dlTxt= dl===null?'':dl<0?`<span style="color:#dc2626;">${Math.abs(dl)}일 초과</span>`:dl===0?`<span style="color:#dc2626;">오늘 마감</span>`:`D-${dl}`;
  const cl   = clProg(p.checklist);
  const tags = (p.tags||[]).map(t=>`<span class="pc-tag badge-gray">${t}</span>`).join('');
  const members = (p.members||[]).slice(0,4).map(m=>
    `<div class="member-av" style="background:${memberColor(m)}" title="${m}">${memberInitial(m)}</div>`
  ).join('');
  const moreCount = (p.members||[]).length > 4 ? `<span class="member-more">+${p.members.length-4}</span>` : '';
  const clBar = cl ? `
    <div class="pc-cl-bar">
      <div class="cl-track"><div class="cl-fill" style="width:${cl.pct}%"></div></div>
      <span class="cl-txt">${cl.done}/${cl.total}</span>
    </div>` : '';

  return `
  <div class="proj-card" onclick="openModal('${p.id}')">
    <div class="pc-top">
      <div class="pc-title">${p.title}</div>
      <div class="pc-actions">
        <button class="pc-btn del" onclick="event.stopPropagation();confirmDelete('${p.id}')" aria-label="삭제"><i class="ti ti-trash"></i></button>
      </div>
    </div>
    ${p.desc?`<div class="pc-desc">${p.desc}</div>`:''}
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
      <span class="status-badge ${STATUS_CFG[p.status].colClass}" style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:9px;">${STATUS_CFG[p.status].label}</span>
      <span class="pri-badge ${pri.badge}">${pri.label}</span>
      ${dlTxt?`<span style="font-size:10px;">${dlTxt}</span>`:''}
    </div>
    ${tags?`<div class="pc-tags">${tags}</div>`:''}
    <div class="pc-meta">
      ${p.start?`<div class="pc-meta-item"><i class="ti ti-calendar"></i>${formatDate(p.start)}</div>`:''}
      ${p.end?`<div class="pc-meta-item"><i class="ti ti-calendar-due"></i>${formatDate(p.end)}</div>`:''}
      ${p.files&&p.files.length?`<div class="pc-meta-item"><i class="ti ti-paperclip"></i>${p.files.length}</div>`:''}
    </div>
    <div class="pc-members">${members}${moreCount}</div>
    <div class="pc-progress">
      <div class="pc-progress-top">
        <span class="pc-progress-label">진행률</span>
        <span class="pc-progress-pct" style="color:${col}">${pct}%</span>
      </div>
      <div class="pc-track"><div class="pc-fill" style="width:${pct}%;background:${col}"></div></div>
    </div>
    ${clBar}
  </div>`;
}

/* ── Timeline ───────────────────────────────────────── */
function renderTimeline(){
  const ft = filtered();
  const tlHeader = document.getElementById('tlHeader');
  const tlBody   = document.getElementById('tlBody');

  if(!ft.length){
    tlHeader.innerHTML = '';
    tlBody.innerHTML   = '<div class="tl-empty"><i class="ti ti-timeline"></i>표시할 프로젝트가 없습니다.</div>';
    return;
  }

  // 전체 날짜 범위 계산 (최소 3개월)
  const allDates = ft.flatMap(p=>[p.start,p.end]).filter(Boolean).map(d=>new Date(d));
  const minDate  = new Date(Math.min(...allDates));
  const maxDate  = new Date(Math.max(...allDates));
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth()+1); maxDate.setDate(0);

  // 월 목록 생성
  const months = [];
  let cur = new Date(minDate);
  while(cur <= maxDate){
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth()+1);
  }
  if(months.length < 3){
    while(months.length < 4){ const last = months[months.length-1]; const n = new Date(last); n.setMonth(n.getMonth()+1); months.push(n); }
  }

  const totalDays = (maxDate - minDate) / 86400000 + 1;
  const today     = new Date();

  // Header
  const todayLabel = `<div class="tl-label-col" style="font-size:10px;font-weight:500;color:var(--sb-muted);text-transform:uppercase;">프로젝트</div>`;
  const monthCols  = months.map(m=>{
    const isCur = m.getFullYear()===today.getFullYear() && m.getMonth()===today.getMonth();
    return `<div class="tl-month${isCur?' current':''}">${m.getFullYear()}.${String(m.getMonth()+1).padStart(2,'0')}</div>`;
  }).join('');
  tlHeader.innerHTML = `${todayLabel}<div class="tl-months">${monthCols}</div>`;

  // Rows
  tlBody.innerHTML = ft.map(p=>{
    const pct   = p.progress||0;
    const col   = pctColor(pct);
    const st    = STATUS_CFG[p.status];
    const pri   = PRI_CFG[p.priority];
    const pStart= p.start ? new Date(p.start) : null;
    const pEnd  = p.end   ? new Date(p.end)   : null;

    let barHtml = '';
    if(pStart && pEnd){
      const rangeStart = months[0]; rangeStart.setDate(1);
      const rangeDays  = (months[months.length-1] - rangeStart) / 86400000 + 31;
      const leftPct    = Math.max(0, (pStart - rangeStart) / 86400000 / rangeDays * 100);
      const widthPct   = Math.min(100-leftPct, (pEnd - pStart) / 86400000 / rangeDays * 100);
      const fillWidth  = widthPct * (pct/100);
      barHtml = `
        <div class="tl-bar-bg" style="left:${leftPct}%;width:${widthPct}%;background:${st.color};">
          ${p.title.length>18?p.title.slice(0,16)+'…':p.title}
        </div>
        <div class="tl-bar-fill" style="left:${leftPct}%;width:${fillWidth}%;background:${col};"></div>`;
    }

    // 오늘 선 위치
    const todayLeft = (today - months[0]) / 86400000 / ((months[months.length-1]-months[0])/86400000+31) * 100;
    const todayLine = `<div class="tl-today-line" style="left:${Math.max(0,Math.min(100,todayLeft))}%"></div>`;

    const members = (p.members||[]).slice(0,3).map(m=>
      `<div class="member-av" style="background:${memberColor(m)};width:18px;height:18px;font-size:7px;" title="${m}">${memberInitial(m)}</div>`
    ).join('');

    return `
      <div class="tl-row" onclick="openModal('${p.id}')">
        <div class="tl-info">
          <div class="tl-info-top">
            <div class="tl-proj-name">${p.title}</div>
          </div>
          <div class="tl-proj-sub">
            <span class="status-badge ${st.colClass}" style="font-size:9px;padding:1px 6px;">${st.label}</span>
            <span style="font-size:10px;font-weight:500;color:${col}">${pct}%</span>
            <div style="display:flex;">${members}</div>
          </div>
        </div>
        <div class="tl-bars">${todayLine}${barHtml}</div>
      </div>`;
  }).join('');
}

/* ── Right Panel ────────────────────────────────────── */
function renderRightPanel(){
  // 상태 현황
  const c={planning:0,inprogress:0,review:0,done:0,hold:0};
  projects.forEach(p=>{ if(c[p.status]!==undefined) c[p.status]++; });
  document.getElementById('statusSummary').innerHTML = Object.entries(STATUS_CFG).map(([k,v])=>`
    <div class="status-row">
      <div class="status-row-left"><div class="status-pip" style="background:${v.color}"></div>${v.label}</div>
      <span style="font-weight:500;color:var(--text-primary);">${c[k]}</span>
    </div>`).join('');

  // 전체 평균 진행률 게이지
  const active = projects.filter(p=>p.status!=='done'&&p.status!=='hold');
  const avg    = projects.length ? Math.round(projects.reduce((s,p)=>s+(p.progress||0),0)/projects.length) : 0;
  const R=36, circ=2*Math.PI*R, offset=circ-(avg/100)*circ, gc=pctColor(avg);
  document.getElementById('bigGauge').innerHTML=`
    <div class="gauge-ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle class="gauge-ring-bg" cx="45" cy="45" r="${R}"/>
        <circle class="gauge-ring-fill" cx="45" cy="45" r="${R}" stroke="${gc}"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="gauge-center-text">
        <div class="gauge-pct-val">${avg}%</div>
        <div class="gauge-pct-label">평균 진행</div>
      </div>
    </div>
    <div class="gauge-sub">총 ${projects.length}개 · 진행중 ${c.inprogress}개</div>`;

  // 마감 임박
  const upcoming = projects
    .filter(p=>p.end&&p.status!=='done'&&p.status!=='hold')
    .map(p=>({...p,dl:daysLeft(p.end)}))
    .filter(p=>p.dl!==null&&p.dl<=14)
    .sort((a,b)=>a.dl-b.dl).slice(0,5);
  const dueEl = document.getElementById('dueSoonList');
  dueEl.innerHTML = upcoming.length ? upcoming.map(p=>{
    const cls = p.dl<=3?'urgent':'soon';
    const txt = p.dl<0?`${Math.abs(p.dl)}일 초과`:p.dl===0?'오늘 마감':`D-${p.dl}`;
    return `<div class="rp-item ${cls}"><div class="rp-item-t">${p.title}</div><div class="rp-item-m">${txt} · ${formatDate(p.end)}</div></div>`;
  }).join('') : '<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">마감 임박 항목 없음</div>';
}

/* ── Modal ──────────────────────────────────────────── */
function openModal(id){
  editingCL=[]; editingFiles=[];
  if(id && typeof id==='string' && id!==''){
    const p = projects.find(x=>x.id===id); if(!p) return;
    document.getElementById('modalTitle').textContent='프로젝트 수정';
    document.getElementById('editId').value=id;
    document.getElementById('fTitle').value=p.title;
    document.getElementById('fPriority').value=p.priority;
    document.getElementById('fStatus').value=p.status;
    document.getElementById('fStart').value=p.start||'';
    document.getElementById('fEnd').value=p.end||'';
    document.getElementById('fOwner').value=p.owner||'';
    document.getElementById('fMembers').value=(p.members||[]).join(', ');
    document.getElementById('fTags').value=(p.tags||[]).join(', ');
    document.getElementById('fProgress').value=p.progress||0;
    document.getElementById('fDesc').value=p.desc||'';
    document.getElementById('fMemo').value=p.memo||'';
    editingCL   = JSON.parse(JSON.stringify(p.checklist||[]));
    editingFiles= [...(p.files||[])];
  } else {
    document.getElementById('modalTitle').textContent='프로젝트 추가';
    document.getElementById('editId').value='';
    ['fTitle','fStart','fEnd','fOwner','fMembers','fTags','fDesc','fMemo'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('fPriority').value='mid';
    document.getElementById('fStatus').value='planning';
    document.getElementById('fProgress').value=0;
  }
  updateModalProgress();
  renderCLList(); renderFileList();
  document.getElementById('modalBackdrop').classList.add('open');
}
function openModalPreset(pri, status){
  openModal('');
  document.getElementById('fPriority').value=pri;
  document.getElementById('fStatus').value=status;
}
function closeModal(e){
  if(e&&e.target!==document.getElementById('modalBackdrop')) return;
  document.getElementById('modalBackdrop').classList.remove('open');
}

/* 진행률 실시간 미리보기 */
document.getElementById('fProgress').addEventListener('input', updateModalProgress);
function updateModalProgress(){
  const v = Math.min(100, Math.max(0, parseInt(document.getElementById('fProgress').value)||0));
  const col = pctColor(v);
  document.getElementById('modalProgressFill').style.width=v+'%';
  document.getElementById('modalProgressFill').style.background=col;
  document.getElementById('modalProgressPct').textContent=v+'%';
  document.getElementById('modalProgressPct').style.color=col;
}

/* ── Checklist ──────────────────────────────────────── */
function addCLItem(){
  const inp=document.getElementById('clInput');
  if(!inp.value.trim()) return;
  editingCL.push({text:inp.value.trim(),done:false});
  inp.value=''; renderCLList();
}
function toggleCL(idx){ editingCL[idx].done=!editingCL[idx].done; renderCLList(); }
function removeCL(idx){ editingCL.splice(idx,1); renderCLList(); }
function renderCLList(){
  const list=document.getElementById('clList');
  list.innerHTML = editingCL.length ? editingCL.map((c,i)=>`
    <div class="cl-item">
      <div class="cl-check ${c.done?'done':''}" onclick="toggleCL(${i})">${c.done?'<i class="ti ti-check"></i>':''}</div>
      <span class="cl-text ${c.done?'done':''}">${c.text}</span>
      <button class="btn-cl-del" onclick="removeCL(${i})" aria-label="삭제"><i class="ti ti-x"></i></button>
    </div>`).join('')
    : '<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">마일스톤 없음</div>';
}
document.getElementById('clInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addCLItem();}});

/* ── File Attach ────────────────────────────────────── */
function handleFiles(files){ Array.from(files).forEach(f=>editingFiles.push(f.name)); renderFileList(); }
function removeFile(idx){ editingFiles.splice(idx,1); renderFileList(); }
function renderFileList(){
  const list=document.getElementById('fileList');
  list.innerHTML = editingFiles.map((f,i)=>`
    <div class="file-item">
      <i class="ti ti-paperclip"></i><span>${f}</span>
      <button class="btn-file-del" onclick="removeFile(${i})" aria-label="삭제"><i class="ti ti-x"></i></button>
    </div>`).join('');
}

/* ── Save ───────────────────────────────────────────── */
function saveProject(){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){alert('프로젝트명을 입력해주세요.');return;}
  const id=document.getElementById('editId').value||`p_${Date.now()}`;
  const rawMembers=document.getElementById('fMembers').value;
  const rawTags   =document.getElementById('fTags').value;
  const proj={
    id, title,
    priority: document.getElementById('fPriority').value,
    status:   document.getElementById('fStatus').value,
    start:    document.getElementById('fStart').value,
    end:      document.getElementById('fEnd').value,
    owner:    document.getElementById('fOwner').value.trim(),
    members:  rawMembers ? rawMembers.split(',').map(s=>s.trim()).filter(Boolean) : [],
    tags:     rawTags    ? rawTags.split(',').map(s=>s.trim()).filter(Boolean)    : [],
    progress: Math.min(100,Math.max(0,parseInt(document.getElementById('fProgress').value)||0)),
    desc:     document.getElementById('fDesc').value.trim(),
    checklist:editingCL,
    files:    editingFiles,
    memo:     document.getElementById('fMemo').value.trim(),
    createdAt:new Date().toISOString().slice(0,10),
  };
  const idx=projects.findIndex(p=>p.id===id);
  if(idx>=0) projects[idx]=proj; else projects.push(proj);
  document.getElementById('modalBackdrop').classList.remove('open');
  renderAll();
}

/* ── Delete ─────────────────────────────────────────── */
function confirmDelete(id){ deleteTarget=id; document.getElementById('deleteBackdrop').classList.add('open'); }
function closeDelete(e){
  if(e&&e.target!==document.getElementById('deleteBackdrop')) return;
  document.getElementById('deleteBackdrop').classList.remove('open');
  deleteTarget=null;
}
document.getElementById('btnConfirmDelete').addEventListener('click',()=>{
  if(!deleteTarget) return;
  projects=projects.filter(p=>p.id!==deleteTarget);
  deleteTarget=null;
  document.getElementById('deleteBackdrop').classList.remove('open');
  renderAll();
});

/* ── Search / Filter ────────────────────────────────── */
document.getElementById('projSearch').addEventListener('input',()=>renderAll());

/* ── Init ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
