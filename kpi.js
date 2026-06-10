/* =====================================================
   INSPIRE — kpi.js  (v2: log feed + feedback)
   ===================================================== */

const KPI_KEY      = 'inspire_kpi_items';
const FB_KEY       = 'inspire_kpi_feedback';


const AVATAR_COLORS = ['#2563eb','#7c3aed','#0f766e','#b45309','#dc2626','#16a34a'];
function avatarColor(name) {
  let h = 0; for (let c of name) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  if (!name) return '?';
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? p[0][0] + p[1][0] : name.slice(0, 2);
}

const INITIAL_KPI = [
  { id:'kpi_1', title:'사건처리 완료율', desc:'접수된 사건보고서 대비 처리 완료 비율 달성',
    status:'inprogress', startDate:'2025-06-01', dueDate:'2025-06-30',
    members:'손대훈, 김아무개', metric:'완료 건수', target:100, current:85,
    logs:[{date:'2025-06-02',value:30,note:'주간 처리 완료'},{date:'2025-06-05',value:60,note:'중간 점검'},{date:'2025-06-06',value:85,note:'현재 누적'}] },
  { id:'kpi_2', title:'데일리 로그 작성률', desc:'매일 근무 종료 전 데일리 로그 작성 완료',
    status:'done', startDate:'2025-06-01', dueDate:'2025-06-30',
    members:'손대훈', metric:'작성 일수', target:22, current:22,
    logs:[{date:'2025-06-06',value:22,note:'월 목표 달성'}] },
  { id:'kpi_3', title:'CCTV 리뷰 완료', desc:'전 구역 CCTV 정기 점검 및 이상 유무 리뷰',
    status:'review', startDate:'2025-06-01', dueDate:'2025-06-30',
    members:'손대훈, 이담당', metric:'리뷰 완료 구역', target:10, current:6,
    logs:[{date:'2025-06-03',value:3,note:'A·B·C 구역'},{date:'2025-06-06',value:6,note:'D·E·F 추가'}] },
  { id:'kpi_4', title:'인수인계 적시 완료', desc:'교대 시 인수인계 문서 제시간 작성 및 서명',
    status:'inprogress', startDate:'2025-06-01', dueDate:'2025-06-30',
    members:'손대훈, 박야간', metric:'적시 완료 건', target:20, current:8,
    logs:[{date:'2025-06-06',value:8,note:'6월 누적'}] },
  { id:'kpi_5', title:'경찰공문 처리', desc:'접수된 경찰 영장·공문 처리 완료율',
    status:'before', startDate:'2025-06-10', dueDate:'2025-06-30',
    members:'손대훈', metric:'처리 건수', target:5, current:0, logs:[] },
];

const INITIAL_FB = {
  kpi_1:[
    { id:'fb_1', author:'김팀장', role:'supervisor', text:'6월 중반까지 85% 달성 좋습니다. 잔여 15건은 이번 주 안에 마무리 목표로 해주세요.', ts:'2025-06-06T10:30:00' },
    { id:'fb_2', author:'이매니저', role:'manager', text:'사건 분류 기준을 통일해서 처리 속도를 높여보면 어떨까요?', ts:'2025-06-05T14:20:00' },
  ],
  kpi_2:[
    { id:'fb_3', author:'김팀장', role:'supervisor', text:'데일리 로그 100% 달성 수고하셨습니다. 다음 달도 유지 부탁드립니다.', ts:'2025-06-06T09:00:00' },
  ],
  kpi_3:[
    { id:'fb_4', author:'박매니저', role:'manager', text:'D·E·F 구역 리뷰 완료 확인했습니다. G구역 CCTV 화질 문제 우선 조치 필요합니다.', ts:'2025-06-06T11:15:00' },
  ],
  kpi_4:[], kpi_5:[],
};

/* ── Storage ─────────────────────────────────────── */
function loadKPI()  { try { const r=localStorage.getItem(KPI_KEY); return r?JSON.parse(r):null; } catch{return null;} }
function loadFB()   { try { const r=localStorage.getItem(FB_KEY);  return r?JSON.parse(r):null; } catch{return null;} }
function saveKPIStore(d) { localStorage.setItem(KPI_KEY,JSON.stringify(d)); }
function saveFBStore(d)  { localStorage.setItem(FB_KEY, JSON.stringify(d)); }

/* ── State ───────────────────────────────────────── */
let kpiItems     = loadKPI() || JSON.parse(JSON.stringify(INITIAL_KPI));
let feedbacks    = loadFB()  || JSON.parse(JSON.stringify(INITIAL_FB));
let activeFilter = 'all';
let editingLogs  = [];
let fbTargetId   = null;

/* ── Helpers ─────────────────────────────────────── */
function getPct(c,t){ return (!t||t<=0)?0:Math.min(100,Math.round(c/t*100)); }
function pctColor(p){ return p>=80?'#16a34a':p>=50?'#2563eb':p>=30?'#d97706':'#dc2626'; }
function statusLabel(s){ return {before:'시작전',inprogress:'진행중',review:'검토중',done:'완료',rejected:'반려'}[s]||s; }
function daysLeft(d){ if(!d)return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function formatDate(d){ return d?d.replace(/-/g,'.'):'' }
function roleLabel(r){ return {supervisor:'팀장',manager:'매니저',peer:'동료'}[r]||r; }
function timeAgo(ts){
  const diff=Date.now()-new Date(ts).getTime();
  const m=Math.floor(diff/60000), h=Math.floor(m/60), d=Math.floor(h/24);
  if(d>0)return `${d}일 전`; if(h>0)return `${h}시간 전`; if(m>0)return `${m}분 전`; return '방금';
}

/* ── Render All ──────────────────────────────────── */
function renderAll(){
  saveKPIStore(kpiItems); saveFBStore(feedbacks);
  renderSummary(); renderCompare(); renderLogFeed();
  renderFeedbackFeed(); renderGrid(); renderRightPanel();
  document.getElementById('sb-kpi-count').textContent = kpiItems.length;
  syncNotifications(); renderNotifBadge();
}

/* ── KPI Notifications Sync ──────────────────────── */
function syncNotifications(){
  const cutoff = Date.now() - 7*86400000;
  notifications = notifications.filter(n=> !n.read || new Date(n.ts).getTime()>=cutoff);

  kpiItems.forEach(k=>{
    if(!k.dueDate||k.status==='done'||k.status==='rejected') return;
    const dl = daysLeft(k.dueDate);
    if(dl!==null && dl<0){
      addNotif({ id:`overdue_${k.id}`, type:'overdue',
        title:'기간 초과', body:`"${k.title}" 이(가) ${Math.abs(dl)}일 초과되었습니다.`,
        ts:new Date().toISOString(), read:false, kpiId:k.id });
    } else if(dl!==null && dl<=3){
      addNotif({ id:`due_soon_${k.id}_${k.dueDate}`, type:'due_soon',
        title:'마감 임박', body:`"${k.title}" 마감${dl===0?'이 오늘':`까지 D-${dl}`}입니다.`,
        ts:new Date().toISOString(), read:false, kpiId:k.id });
    }
  });
  saveNotifStore();
}

/* ── Summary Row ─────────────────────────────────── */
function renderSummary(){
  const c={before:0,inprogress:0,review:0,done:0,rejected:0};
  kpiItems.forEach(k=>{ if(c[k.status]!==undefined) c[k.status]++; });
  const overdue = kpiItems.filter(k=>
    k.status!=='done'&&k.status!=='rejected'&&k.dueDate&&daysLeft(k.dueDate)<0
  ).length;
  const defs=[
    {key:'before',label:'시작전',color:'#94a3b8'},
    {key:'inprogress',label:'진행중',color:'#2563eb'},
    {key:'review',label:'검토중',color:'#d97706'},
    {key:'done',label:'완료',color:'#16a34a'},
    {key:'rejected',label:'반려',color:'#dc2626'},
    {key:'overdue',label:'기간 초과',color:'#9f1239'},
  ];
  document.getElementById('kpiSummaryRow').innerHTML = defs.map(d=>`
    <div class="summary-card s-${d.key}">
      <div class="summary-card-top">
        <div class="summary-label">${d.label}</div>
        <div class="summary-dot" style="background:${d.color}"></div>
      </div>
      <div class="summary-val">${d.key==='overdue'?overdue:c[d.key]}</div>
    </div>`).join('');
}

/* ── Compare (compact) ───────────────────────────── */
function getMonthLastValue(logs, year, month){
  const filtered = (logs||[]).filter(l=>{
    const d = new Date(l.date);
    return d.getFullYear()===year && d.getMonth()+1===month;
  });
  if(!filtered.length) return null;
  filtered.sort((a,b)=>b.date.localeCompare(a.date));
  return filtered[0].value;
}

function renderCompare(){
  const now = new Date();
  const currYear  = now.getFullYear();
  const currMonth = now.getMonth() + 1;
  const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYear  = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;

  const badge = document.getElementById('compareBadge');
  if(badge) badge.textContent = `${prevMonth}월→${currMonth}월`;

  const area = document.getElementById('compareArea');
  const active = kpiItems.filter(k=>k.target>0);
  if(!active.length){ area.innerHTML='<div class="feed-empty"><i class="ti ti-chart-off"></i>데이터 없음</div>'; return; }

  const rows = active.map(k=>{
    const currVal = getMonthLastValue(k.logs, currYear, currMonth) ?? k.current;
    const prevVal = getMonthLastValue(k.logs, prevYear, prevMonth) ?? 0;
    const curr = getPct(currVal, k.target);
    const prev = getPct(prevVal, k.target);
    const diff = curr - prev;
    const diffHtml = diff===0?'':`<span class="${diff>0?'compare-diff-pos':'compare-diff-neg'}" style="font-size:9px">${diff>0?'+':''}${diff}%</span>`;
    return `
      <div class="compare-row">
        <div class="compare-label" title="${k.title}">${k.title}</div>
        <div class="compare-bars">
          <div class="compare-bar-line">
            <div class="compare-bar-tag">${prevMonth}월</div>
            <div class="compare-track"><div class="compare-fill prev" style="width:${prev}%"></div></div>
            <div class="compare-pct">${prev}%</div>
          </div>
          <div class="compare-bar-line">
            <div class="compare-bar-tag">${currMonth}월</div>
            <div class="compare-track"><div class="compare-fill curr" style="width:${curr}%"></div></div>
            <div class="compare-pct">${curr}% ${diffHtml}</div>
          </div>
        </div>
      </div>`;
  }).join('');
  area.innerHTML = rows;
  // legend
  const existing = area.parentElement.querySelector('.cmp-legend');
  if(existing) existing.remove();
  area.insertAdjacentHTML('afterend',`
    <div class="cmp-legend">
      <div class="cmp-legend-item"><div class="cmp-legend-dot" style="background:#94a3b8"></div>${prevMonth}월</div>
      <div class="cmp-legend-item"><div class="cmp-legend-dot" style="background:#2563eb"></div>${currMonth}월</div>
    </div>`);
}

/* ── Log Feed ────────────────────────────────────── */
function renderLogFeed(){
  // 모든 KPI의 로그를 flat하게 모아 최신 순 정렬
  const allLogs = [];
  kpiItems.forEach(k=>{
    (k.logs||[]).forEach(l=>{
      allLogs.push({ ...l, kpiId:k.id, kpiTitle:k.title, pct:getPct(k.current,k.target) });
    });
  });
  allLogs.sort((a,b)=> b.date.localeCompare(a.date) || 0);
  const top = allLogs.slice(0,10);

  document.getElementById('logCount').textContent = top.length;
  const feed = document.getElementById('logFeed');
  if(!top.length){
    feed.innerHTML='<div class="feed-empty"><i class="ti ti-clipboard-off"></i>진행 로그가 없습니다</div>'; return;
  }
  feed.innerHTML = top.map(l=>{
    const col = pctColor(l.pct);
    return `
      <div class="log-feed-item">
        <div class="log-feed-dot" style="background:${col}"></div>
        <div class="log-feed-body">
          <div class="log-feed-top">
            <span class="log-feed-kpi">${l.kpiTitle}</span>
            <span class="log-feed-val">${l.value}</span>
          </div>
          ${l.note?`<div class="log-feed-note">${l.note}</div>`:''}
          <div class="log-feed-meta">${formatDate(l.date)}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── Feedback Feed ───────────────────────────────── */
function renderFeedbackFeed(){
  const allFb = [];
  Object.entries(feedbacks).forEach(([kpiId, fbs])=>{
    const kpi = kpiItems.find(k=>k.id===kpiId);
    if(!kpi) return;
    fbs.forEach(f=> allFb.push({ ...f, kpiId, kpiTitle:kpi.title }));
  });
  allFb.sort((a,b)=> new Date(b.ts)-new Date(a.ts));
  const top = allFb.slice(0,8);

  document.getElementById('feedbackCount').textContent = allFb.length;
  const feed = document.getElementById('feedbackFeed');
  if(!top.length){
    feed.innerHTML='<div class="feed-empty"><i class="ti ti-message-off"></i>피드백이 없습니다</div>'; return;
  }
  feed.innerHTML = top.map(f=>`
    <div class="fb-feed-item" onclick="openFeedbackModal('${f.kpiId}')">
      <div class="fb-feed-avatar" style="background:${avatarColor(f.author)}">${initials(f.author)}</div>
      <div class="fb-feed-body">
        <div class="fb-feed-top">
          <span class="fb-feed-author">${f.author}</span>
          <span class="fb-feed-role role-${f.role}">${roleLabel(f.role)}</span>
        </div>
        <div class="fb-feed-kpi">${f.kpiTitle}</div>
        <div class="fb-feed-text">${f.text}</div>
        <div class="fb-feed-time">${timeAgo(f.ts)}</div>
      </div>
    </div>`).join('');
}

/* ── KPI Grid ────────────────────────────────────── */
function renderGrid(){
  const filtered = activeFilter==='all' ? kpiItems : kpiItems.filter(k=>k.status===activeFilter);
  const q = (document.getElementById('kpiSearch')?.value||'').toLowerCase();
  const items = q ? filtered.filter(k=>k.title.toLowerCase().includes(q)||(k.members||'').toLowerCase().includes(q)) : filtered;

  const grid = document.getElementById('kpiGrid');
  if(!items.length){
    grid.innerHTML=`<div class="kpi-empty"><i class="ti ti-mood-empty"></i><p>${q?'검색 결과가 없습니다.':'등록된 KPI 항목이 없습니다.'}</p></div>`;
    return;
  }
  grid.innerHTML = items.map(k=>{
    const pct=getPct(k.current,k.target), col=pctColor(pct);
    const dl=daysLeft(k.dueDate);
    const dlText=dl===null?'':dl<0?'기간 초과':dl===0?'오늘 마감':`D-${dl}`;
    const dlColor=dl!==null&&dl<=3?'#dc2626':'var(--text-sec)';
    const kpiFbs=(feedbacks[k.id]||[]);
    const lastFb=kpiFbs.length?kpiFbs[kpiFbs.length-1]:null;
    return `
      <div class="kpi-card" data-id="${k.id}" onclick="handleCardClick(event,'${k.id}')" style="cursor:pointer;">
        <div class="kc-top">
          <div class="kc-title-wrap">
            <div class="kc-title">${k.title}</div>
            ${k.desc?`<div class="kc-desc">${k.desc}</div>`:''}
          </div>
          <div class="kc-actions">
            <button class="kc-btn fb" onclick="openFeedbackModal('${k.id}')" title="피드백" aria-label="피드백">
              <i class="ti ti-message-circle"></i>
            </button>
            <button class="kc-btn" onclick="openModal('${k.id}')" title="수정" aria-label="수정">
              <i class="ti ti-edit"></i>
            </button>
            <button class="kc-btn del" onclick="confirmDelete('${k.id}')" title="삭제" aria-label="삭제">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
          <span class="status-badge status-${k.status}">${statusLabel(k.status)}</span>
          ${dlText?`<span style="font-size:10px;color:${dlColor};font-weight:500;">${dlText}</span>`:''}
        </div>
        <div class="kc-meta">
          ${k.startDate?`<div class="kc-meta-item"><i class="ti ti-calendar"></i>${formatDate(k.startDate)}</div>`:''}
          ${k.dueDate  ?`<div class="kc-meta-item"><i class="ti ti-calendar-due"></i>${formatDate(k.dueDate)}</div>`:''}
          ${k.members  ?`<div class="kc-meta-item"><i class="ti ti-users"></i>${k.members}</div>`:''}
        </div>
        ${k.target>0?`
        <div class="kc-progress">
          <div class="kc-progress-top">
            <div class="kc-metric-label">${k.metric||'Metric'}</div>
            <div class="kc-progress-nums">${k.current} <span>/ ${k.target}</span></div>
          </div>
          <div class="kc-track"><div class="kc-fill" style="width:${pct}%;background:${col}"></div></div>
          <div class="kc-pct" style="color:${col}">${pct}% 달성</div>
        </div>`:''}
        <div class="kc-footer">
          <div class="kc-fb-count" onclick="openFeedbackModal('${k.id}')">
            <i class="ti ti-message-circle"></i>
            피드백 ${kpiFbs.length}건
          </div>
          ${lastFb?`<div class="kc-last-fb">${lastFb.author}: ${lastFb.text}</div>`:'<div class="kc-last-fb" style="color:var(--card-border)">피드백 없음</div>'}
        </div>
      </div>`;
  }).join('');
}

/* ── Right Panel ─────────────────────────────────── */
function renderRightPanel(){
  const c={before:0,inprogress:0,review:0,done:0,rejected:0};
  kpiItems.forEach(k=>{ if(c[k.status]!==undefined) c[k.status]++; });
  const defs=[
    {key:'before',label:'시작전',color:'#94a3b8'},
    {key:'inprogress',label:'진행중',color:'#2563eb'},
    {key:'review',label:'검토중',color:'#d97706'},
    {key:'done',label:'완료',color:'#16a34a'},
    {key:'rejected',label:'반려',color:'#dc2626'},
  ];
  document.getElementById('statusSummary').innerHTML = defs.map(d=>`
    <div class="status-row">
      <div class="status-row-left"><div class="status-pip" style="background:${d.color}"></div>${d.label}</div>
      <div class="status-row-count">${c[d.key]}</div>
    </div>`).join('');

  const active=kpiItems.filter(k=>k.target>0);
  const avg=active.length?Math.round(active.reduce((s,k)=>s+getPct(k.current,k.target),0)/active.length):0;
  const R=36, circ=2*Math.PI*R, offset=circ-(avg/100)*circ, gc=pctColor(avg);
  document.getElementById('bigGauge').innerHTML=`
    <div class="gauge-ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle class="gauge-ring-bg" cx="45" cy="45" r="${R}"/>
        <circle class="gauge-ring-fill" cx="45" cy="45" r="${R}"
          stroke="${gc}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="gauge-center-text">
        <div class="gauge-pct-val">${avg}%</div>
        <div class="gauge-pct-label">평균 달성</div>
      </div>
    </div>
    <div class="gauge-sub">총 ${kpiItems.length}개 항목<br>완료 ${c.done}개</div>`;

  const withDays=kpiItems
    .filter(k=>k.dueDate&&k.status!=='done'&&k.status!=='rejected')
    .map(k=>({...k,dl:daysLeft(k.dueDate)}));

  const upcoming=withDays.filter(k=>k.dl!==null&&k.dl>=0&&k.dl<=7).sort((a,b)=>a.dl-b.dl).slice(0,5);
  const dueEl=document.getElementById('dueSoonList');
  dueEl.innerHTML=upcoming.length?upcoming.map(k=>{
    const cls=k.dl<=2?'urgent':'soon';
    const t=k.dl===0?'오늘 마감':`D-${k.dl}`;
    return `<div class="due-item ${cls}"><div class="due-item-title">${k.title}</div><div class="due-item-meta">${t} · ${formatDate(k.dueDate)}</div></div>`;
  }).join(''):'<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">마감 임박 항목 없음</div>';

  const overdued=withDays.filter(k=>k.dl!==null&&k.dl<0).sort((a,b)=>a.dl-b.dl);
  const overdueEl=document.getElementById('overdueList');
  overdueEl.innerHTML=overdued.length?overdued.map(k=>`
    <div class="due-item overdue">
      <div class="due-item-title">${k.title}</div>
      <div class="due-item-meta">${Math.abs(k.dl)}일 초과 · ${formatDate(k.dueDate)}</div>
    </div>`).join(''):'<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">기간 초과 항목 없음</div>';
}

/* ── Filter / Search ─────────────────────────────── */
document.getElementById('filterTabs').addEventListener('click',e=>{
  const btn=e.target.closest('.filter-tab'); if(!btn)return;
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); activeFilter=btn.dataset.filter; renderGrid();
});
document.getElementById('kpiSearch').addEventListener('input',()=>renderGrid());

/* ── Card Click ──────────────────────────────────── */
function handleCardClick(e, id){
  if(e.target.closest('button')) return;
  openModal(id);
}

/* ── KPI Modal ───────────────────────────────────── */
function openModal(id){
  editingLogs=[];
  if(id){
    const item=kpiItems.find(k=>k.id===id); if(!item)return;
    document.getElementById('modalTitle').textContent='KPI 수정';
    document.getElementById('editId').value=id;
    document.getElementById('fTitle').value=item.title;
    document.getElementById('fStatus').value=item.status;
    document.getElementById('fDesc').value=item.desc||'';
    document.getElementById('fStart').value=item.startDate||'';
    document.getElementById('fDue').value=item.dueDate||'';
    document.getElementById('fMembers').value=item.members||'';
    document.getElementById('fMetric').value=item.metric||'';
    document.getElementById('fTarget').value=item.target||'';
    document.getElementById('fCurrent').value=item.current||'';
    editingLogs=JSON.parse(JSON.stringify(item.logs||[]));
  } else {
    document.getElementById('modalTitle').textContent='KPI 추가';
    ['editId','fTitle','fDesc','fStart','fDue','fMembers','fMetric','fTarget','fCurrent'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('fStatus').value='before';
  }
  document.getElementById('fLogDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('fLogValue').value='';
  document.getElementById('fLogNote').value='';
  updateModalProgress(); renderLogList();
  document.getElementById('modalBackdrop').classList.add('open');
}
function closeModal(e){
  if(e&&e.target!==document.getElementById('modalBackdrop'))return;
  document.getElementById('modalBackdrop').classList.remove('open');
}
document.getElementById('fCurrent').addEventListener('input',updateModalProgress);
document.getElementById('fTarget').addEventListener('input',updateModalProgress);
function updateModalProgress(){
  const c=parseFloat(document.getElementById('fCurrent').value)||0;
  const t=parseFloat(document.getElementById('fTarget').value)||0;
  const p=t>0?Math.min(100,Math.round(c/t*100)):0;
  document.getElementById('modalProgressFill').style.width=p+'%';
  document.getElementById('modalProgressFill').style.background=pctColor(p);
  document.getElementById('modalProgressPct').textContent=p+'%';
}
function addLogEntry(){
  const date=document.getElementById('fLogDate').value;
  const val=document.getElementById('fLogValue').value;
  const note=document.getElementById('fLogNote').value;
  if(!date||val==='')return;
  editingLogs.push({date,value:parseFloat(val),note});
  editingLogs.sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById('fLogValue').value='';
  document.getElementById('fLogNote').value='';
  renderLogList();
}
function removeLogEntry(idx){ editingLogs.splice(idx,1); renderLogList(); }
function renderLogList(){
  const list=document.getElementById('fLogList');
  if(!editingLogs.length){ list.innerHTML='<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">로그 없음</div>'; return; }
  list.innerHTML=[...editingLogs].reverse().map((l,ri)=>{
    const idx=editingLogs.length-1-ri;
    return `<div class="log-entry-row">
      <span class="le-date">${formatDate(l.date)}</span>
      <span class="le-val">${l.value}</span>
      <span class="le-note">${l.note||''}</span>
      <button class="btn-log-del" onclick="removeLogEntry(${idx})" aria-label="삭제"><i class="ti ti-x"></i></button>
    </div>`;
  }).join('');
}
function saveKPI(){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){ alert('Title을 입력해주세요.'); return; }
  const editId=document.getElementById('editId').value;
  const id=editId||`kpi_${Date.now()}`;
  const prevItem=kpiItems.find(k=>k.id===id);
  const item={
    id, title,
    desc:    document.getElementById('fDesc').value.trim(),
    status:  document.getElementById('fStatus').value,
    startDate:document.getElementById('fStart').value,
    dueDate: document.getElementById('fDue').value,
    members: document.getElementById('fMembers').value.trim(),
    metric:  document.getElementById('fMetric').value.trim(),
    target:  parseFloat(document.getElementById('fTarget').value)||0,
    current: parseFloat(document.getElementById('fCurrent').value)||0,
    logs:    editingLogs,
  };
  const idx=kpiItems.findIndex(k=>k.id===id);
  if(idx>=0) kpiItems[idx]=item; else { kpiItems.push(item); if(!feedbacks[id]) feedbacks[id]=[]; }

  const ts = new Date().toISOString();
  if(!editId){
    addNotif({ id:`kpi_add_${id}`, type:'kpi_add',
      title:'KPI 추가됨', body:`"${title}" KPI가 등록되었습니다.`, ts, read:false, kpiId:id });
  } else if(prevItem && prevItem.status!==item.status){
    if(item.status==='done'){
      addNotif({ id:`kpi_done_${id}_${Date.now()}`, type:'kpi_done',
        title:'KPI 완료', body:`"${title}" KPI가 완료 처리되었습니다.`, ts, read:false, kpiId:id });
    } else {
      addNotif({ id:`kpi_status_${id}_${Date.now()}`, type:'kpi_status',
        title:'KPI 상태 변경', body:`"${title}" 상태가 ${statusLabel(item.status)}(으)로 변경되었습니다.`, ts, read:false, kpiId:id });
    }
  }

  document.getElementById('modalBackdrop').classList.remove('open');
  renderAll();
}

/* ── Feedback Modal ──────────────────────────────── */
function openFeedbackModal(kpiId){
  fbTargetId=kpiId;
  const kpi=kpiItems.find(k=>k.id===kpiId); if(!kpi)return;
  document.getElementById('fbModalTitle').textContent='피드백';
  document.getElementById('fbModalKpiName').textContent=kpi.title;
  document.getElementById('fbAuthorName').value='';
  document.getElementById('fbText').value='';
  renderFbThread();
  document.getElementById('feedbackBackdrop').classList.add('open');
}
function closeFeedbackModal(e){
  if(e&&e.target!==document.getElementById('feedbackBackdrop'))return;
  document.getElementById('feedbackBackdrop').classList.remove('open');
  fbTargetId=null;
}
function renderFbThread(){
  const fbs=feedbacks[fbTargetId]||[];
  const thread=document.getElementById('fbThread');
  if(!fbs.length){
    thread.innerHTML='<div class="feed-empty"><i class="ti ti-message-off"></i>아직 피드백이 없습니다</div>'; return;
  }
  thread.innerHTML=[...fbs].reverse().map((f,ri)=>{
    const idx=fbs.length-1-ri;
    return `
      <div class="fb-item">
        <div class="fb-avatar" style="background:${avatarColor(f.author)}">${initials(f.author)}</div>
        <div class="fb-body">
          <div class="fb-top">
            <span class="fb-author">${f.author}</span>
            <span class="fb-role role-${f.role}">${roleLabel(f.role)}</span>
            <span class="fb-time">${timeAgo(f.ts)}</span>
          </div>
          <div class="fb-text">${f.text}</div>
        </div>
        <button class="fb-del-btn" onclick="deleteFeedback(${idx})" aria-label="삭제"><i class="ti ti-x"></i></button>
      </div>`;
  }).join('');
}
function deleteFeedback(idx){
  const fbs=feedbacks[fbTargetId]||[];
  fbs.splice(idx,1);
  feedbacks[fbTargetId]=fbs;
  saveFBStore(feedbacks);
  renderFbThread(); renderFeedbackFeed(); renderGrid();
}
function submitFeedback(){
  const author=document.getElementById('fbAuthorName').value.trim();
  const text  =document.getElementById('fbText').value.trim();
  const role  =document.getElementById('fbAuthorRole').value;
  if(!author||!text){ alert('작성자와 피드백 내용을 입력해주세요.'); return; }
  if(!feedbacks[fbTargetId]) feedbacks[fbTargetId]=[];
  const ts = new Date().toISOString();
  feedbacks[fbTargetId].push({ id:`fb_${Date.now()}`, author, role, text, ts });
  saveFBStore(feedbacks);
  const kpi = kpiItems.find(k=>k.id===fbTargetId);
  if(kpi){
    addNotif({ id:`feedback_${fbTargetId}_${Date.now()}`, type:'feedback',
      title:'새 피드백', body:`"${kpi.title}" 에 ${author}(${roleLabel(role)})의 피드백이 등록되었습니다.`,
      ts, read:false, kpiId:fbTargetId });
    renderNotifBadge();
  }
  document.getElementById('fbText').value='';
  document.getElementById('fbAuthorName').value='';
  renderFbThread(); renderFeedbackFeed(); renderGrid();
}

/* ── CSV Export ──────────────────────────────────── */
function exportKPItoCSV(){
  const headers = ['제목','상태','설명','시작일','마감일','담당자','지표','목표값','현재값','달성률(%)'];
  const rows = kpiItems.map(k=>[
    k.title,
    statusLabel(k.status),
    k.desc||'',
    k.startDate||'',
    k.dueDate||'',
    k.members||'',
    k.metric||'',
    k.target,
    k.current,
    getPct(k.current,k.target)
  ].map(v=>`"${String(v).replace(/"/g,'""')}"`));

  const csv = '﻿' + [headers, ...rows].map(r=>r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
  a.href = url;
  a.download = `KPI_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Delete ──────────────────────────────────────── */
let deleteTargetId=null;
function confirmDelete(id){ deleteTargetId=id; document.getElementById('deleteBackdrop').classList.add('open'); }
function closeDelete(e){
  if(e&&e.target!==document.getElementById('deleteBackdrop'))return;
  document.getElementById('deleteBackdrop').classList.remove('open'); deleteTargetId=null;
}
document.getElementById('btnConfirmDelete').addEventListener('click',()=>{
  if(!deleteTargetId)return;
  kpiItems=kpiItems.filter(k=>k.id!==deleteTargetId);
  delete feedbacks[deleteTargetId];
  deleteTargetId=null;
  document.getElementById('deleteBackdrop').classList.remove('open');
  renderAll();
});

/* ── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
