/* =====================================================
   INSPIRE — admin-project.js
===================================================== */
const PROJ_KEY    = 'inspire_projects';
const PROJ_CMT_KEY= 'inspire_proj_comments';

const TEAM_MEMBERS = [
  { name:'손대훈',  color:'#7c3aed' },
  { name:'김아무개',color:'#2563eb' },
  { name:'이담당',  color:'#0f766e' },
  { name:'박야간',  color:'#b45309' },
];
const STATUS_CFG = {
  planning:   { label:'기획중', color:'#94a3b8' },
  inprogress: { label:'진행중', color:'#2563eb' },
  review:     { label:'검토중', color:'#d97706' },
  done:       { label:'완료',   color:'#16a34a' },
  hold:       { label:'보류',   color:'#dc2626' },
};
const PRI_CFG = {
  high:{ label:'높음', cls:'pri-high' },
  mid: { label:'중간', cls:'pri-mid'  },
  low: { label:'낮음', cls:'pri-low'  },
};
const CMT_TYPE = {
  comment:         { label:'코멘트',   cls:'ctype-comment' },
  approve:         { label:'승인',     cls:'ctype-approve' },
  request_revision:{ label:'수정요청', cls:'ctype-revision' },
  reject:          { label:'반려',     cls:'ctype-reject' },
};

/* ── 헬퍼 ──────────────────────────────────────── */
function daysLeft(d){ if(!d) return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function formatDate(d){ return d?d.replace(/-/g,'.'):'—'; }
function timeAgo(ts){ const diff=Date.now()-new Date(ts).getTime(),m=Math.floor(diff/60000),h=Math.floor(m/60),dd=Math.floor(h/24); if(dd>0)return `${dd}일 전`; if(h>0)return `${h}시간 전`; if(m>0)return `${m}분 전`; return '방금'; }
function memberColor(name){ const m=TEAM_MEMBERS.find(x=>x.name===name); return m?m.color:'#94a3b8'; }
function initials(name){ return name?name.slice(0,2):'?'; }
function pctColor(p){ return p>=80?'#16a34a':p>=50?'#2563eb':p>=30?'#d97706':'#dc2626'; }
function riskLevel(endDate,status){
  if(!endDate||status==='done'||status==='hold') return 'none';
  const dl=daysLeft(endDate);
  if(dl===null) return 'none';
  if(dl<0)   return 'critical';
  if(dl<=7)  return 'critical';
  if(dl<=14) return 'warning';
  return 'safe';
}
function riskLabel(l){ return {critical:'긴급',warning:'주의',safe:'정상',none:'—'}[l]||'—'; }
function riskClass(l){ return {critical:'risk-critical',warning:'risk-warning',safe:'risk-safe',none:'risk-none'}[l]||'risk-none'; }

/* ── Storage ───────────────────────────────────── */
function loadProjs()   { try{ return JSON.parse(localStorage.getItem(PROJ_KEY)||'[]'); }catch{ return []; } }
function saveProjs(d)  { localStorage.setItem(PROJ_KEY, JSON.stringify(d)); }
function loadComments(){ try{ return JSON.parse(localStorage.getItem(PROJ_CMT_KEY)||'{}'); }catch{ return {}; } }
function saveComments(d){ localStorage.setItem(PROJ_CMT_KEY, JSON.stringify(d)); }

/* ── State ─────────────────────────────────────── */
let selectedIds   = new Set();
let deleteTarget  = null;
let progressTarget= null;
let commentTarget = null;

/* ── Filter ─────────────────────────────────────── */
function filteredProjs(statusOverride){
  const projs = loadProjs();
  const q   = (document.getElementById('projSearch')?.value||'').toLowerCase();
  const st  = statusOverride || document.getElementById('statusFilterTbl')?.value||'all';
  const pri = document.getElementById('priFilterTbl')?.value||'all';
  const risk= document.getElementById('riskFilterTbl')?.value||'all';
  const sort= document.getElementById('sortTbl')?.value||'end';
  let res = projs.filter(p=>{
    if(st!=='all'   && p.status!==st)                          return false;
    if(pri!=='all'  && p.priority!==pri)                       return false;
    if(risk!=='all' && riskLevel(p.end,p.status)!==risk)       return false;
    if(q && !p.title.toLowerCase().includes(q) && !(p.owner||'').toLowerCase().includes(q) && !(p.members||[]).join('').toLowerCase().includes(q)) return false;
    return true;
  });
  res.sort((a,b)=>{
    if(sort==='end')      return (a.end||'9999').localeCompare(b.end||'9999');
    if(sort==='progress') return (b.progress||0)-(a.progress||0);
    if(sort==='owner')    return (a.owner||'').localeCompare(b.owner||'','ko');
    const O={high:0,mid:1,low:2}; return (O[a.priority]??1)-(O[b.priority]??1);
  });
  return res;
}

/* ── Render All ─────────────────────────────────── */
function renderAll(){
  renderSummary();
  renderMemberChart();
  renderRiskArea();
  renderCommentFeed();
  renderTimeline();
  renderProjTable();
}

/* ── 요약 ───────────────────────────────────────── */
function renderSummary(){
  const projs = loadProjs();
  const c={planning:0,inprogress:0,review:0,done:0,hold:0};
  projs.forEach(p=>{ if(c[p.status]!==undefined) c[p.status]++; });
  const avgProg = projs.length?Math.round(projs.reduce((s,p)=>s+(p.progress||0),0)/projs.length):0;
  const critical= projs.filter(p=>riskLevel(p.end,p.status)==='critical').length;
  const defs=[
    { ic:'ti-layout-kanban',  cls:'purple', label:'전체 Project', val:projs.length+'개', sub:'' },
    { ic:'ti-player-play',    cls:'blue',   label:'진행중',        val:c.inprogress+'개', sub:'' },
    { ic:'ti-eye',            cls:'amber',  label:'검토 대기',     val:c.review+'개',     sub:'승인 대기' },
    { ic:'ti-circle-check',   cls:'green',  label:'완료',          val:c.done+'개',       sub:'' },
    { ic:'ti-chart-bar',      cls:'purple', label:'평균 진행률',   val:avgProg+'%',       sub:'' },
    { ic:'ti-alert-triangle', cls:'red',    label:'위험 프로젝트', val:critical+'개',     sub:'7일 이내' },
  ];
  document.getElementById('apSummary').innerHTML = defs.map(d=>`
    <div class="aps-card">
      <div class="aps-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div><div class="aps-label">${d.label}</div><div class="aps-val">${d.val}</div>${d.sub?`<div class="aps-sub">${d.sub}</div>`:''}</div>
    </div>`).join('');
  document.getElementById('totalProjBadge').textContent = projs.length;
}

/* ── 사원별 Project 비교 ─────────────────────────── */
function renderMemberChart(){
  const projs = loadProjs();
  const area  = document.getElementById('memberProjArea');
  const rows  = TEAM_MEMBERS.map(m=>{
    const mp   = projs.filter(p=>(p.members||[]).includes(m.name)||(p.owner===m.name));
    if(!mp.length) return '';
    const avgP = mp.length?Math.round(mp.reduce((s,p)=>s+(p.progress||0),0)/mp.length):0;
    const col  = pctColor(avgP);
    const chips= Object.entries(STATUS_CFG).map(([k,v])=>{
      const cnt=mp.filter(p=>p.status===k).length;
      return cnt?`<span class="mp-chip" style="background:${v.color}20;color:${v.color};border-color:${v.color}40;">${v.label} ${cnt}</span>`:'';
    }).filter(Boolean).join('');
    return `
      <div class="mp-row">
        <div class="mp-av" style="background:${m.color}">${initials(m.name)}</div>
        <div class="mp-info">
          <div class="mp-name"><span>${m.name}</span><span class="mp-count">${mp.length}개</span></div>
          <div class="mp-avg-bar-row">
            <div class="mp-avg-track"><div class="mp-avg-fill" style="width:${avgP}%;background:${col};"></div></div>
            <div class="mp-avg-pct" style="color:${col};">${avgP}%</div>
          </div>
          <div class="mp-status-chips">${chips}</div>
        </div>
      </div>`;
  }).filter(Boolean).join('');
  area.innerHTML = rows||'<div style="padding:20px;text-align:center;font-size:11px;color:var(--text-sec);">Project 없음</div>';
}

/* ── 마감 위험도 ─────────────────────────────────── */
function renderRiskArea(){
  const projs = loadProjs();
  const area  = document.getElementById('projRiskArea');
  const risky = projs
    .filter(p=>riskLevel(p.end,p.status)!=='none')
    .map(p=>({...p,risk:riskLevel(p.end,p.status),dl:daysLeft(p.end)}))
    .sort((a,b)=>{ const O={critical:0,warning:1,safe:2}; return O[a.risk]-O[b.risk]||(a.dl-b.dl); })
    .slice(0,7);
  document.getElementById('riskProjBadge').textContent = risky.filter(p=>p.risk==='critical').length;
  if(!risky.length){ area.innerHTML='<div class="area-empty"><i class="ti ti-mood-happy"></i>위험 프로젝트 없음</div>'; return; }
  area.innerHTML = risky.map(p=>{
    const pct = p.progress||0;
    const dlTxt = p.dl<0?`${Math.abs(p.dl)}일 초과`:p.dl===0?'오늘 마감':`D-${p.dl}`;
    return `
      <div class="prisk-item ${p.risk}" onclick="scrollToRow('${p.id}')">
        <i class="ti ${p.risk==='critical'?'ti-alert-triangle':'ti-alert-circle'} prisk-icon"></i>
        <div style="flex:1;min-width:0;">
          <div class="prisk-title">${p.title}</div>
          <div class="prisk-meta">${dlTxt} · ${p.owner||'미배정'} · ${STATUS_CFG[p.status]?.label||''}</div>
          <div class="prisk-prog"><div class="prisk-track"><div class="prisk-fill" style="width:${pct}%;"></div></div></div>
        </div>
        <div style="font-size:10px;font-weight:500;">${pct}%</div>
      </div>`;
  }).join('');
}

/* ── 코멘트 피드 ─────────────────────────────────── */
function renderCommentFeed(){
  const projs    = loadProjs();
  const comments = loadComments();
  const all=[];
  Object.entries(comments).forEach(([pid,list])=>{
    const proj=projs.find(p=>p.id===pid);
    (list||[]).forEach(c=>all.push({...c,projTitle:proj?.title||pid,projId:pid}));
  });
  all.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const top=all.slice(0,8);
  document.getElementById('projCommentBadge').textContent=all.length;
  const feed=document.getElementById('projCommentFeed');
  if(!top.length){ feed.innerHTML='<div class="area-empty"><i class="ti ti-message-off"></i>코멘트 없음</div>'; return; }
  feed.innerHTML=top.map(c=>{
    const tCfg=CMT_TYPE[c.type]||CMT_TYPE.comment;
    return `
      <div class="pcf-item" onclick="openCommentModal('${c.projId}')">
        <div class="pcf-av" style="background:${memberColor(c.author||'관')}">${initials(c.author||'관')}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
            <span class="pcf-author">${c.author||'관리자'}</span>
            <span class="ctype-badge ${tCfg.cls}">${tCfg.label}</span>
          </div>
          <div class="pcf-proj">${c.projTitle}</div>
          <div class="pcf-text">${c.text}</div>
          <div class="pcf-time">${timeAgo(c.ts)}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── 타임라인 ───────────────────────────────────── */
function renderTimeline(){
  const st    = document.getElementById('tlStatusFilter')?.value||'all';
  const projs = st==='all'?loadProjs():loadProjs().filter(p=>p.status===st);
  const hdr   = document.getElementById('tlHeader');
  const body  = document.getElementById('tlBody');
  document.getElementById('tlProjCount').textContent = projs.length;

  if(!projs.length){
    hdr.innerHTML=''; body.innerHTML='<div class="tl-empty"><i class="ti ti-timeline-event-exclamation"></i>표시할 프로젝트가 없습니다.</div>'; return;
  }

  const allDates = projs.flatMap(p=>[p.start,p.end]).filter(Boolean).map(d=>new Date(d));
  let minDate=new Date(Math.min(...allDates)); minDate.setDate(1);
  let maxDate=new Date(Math.max(...allDates)); maxDate.setMonth(maxDate.getMonth()+1); maxDate.setDate(0);

  const months=[];
  let cur=new Date(minDate);
  while(cur<=maxDate){ months.push(new Date(cur)); cur.setMonth(cur.getMonth()+1); }
  while(months.length<5){ const l=months[months.length-1]; const n=new Date(l); n.setMonth(n.getMonth()+1); months.push(n); }

  const today     = new Date();
  const rangeStart= new Date(months[0]); rangeStart.setDate(1);
  const rangeEnd  = new Date(months[months.length-1]); rangeEnd.setMonth(rangeEnd.getMonth()+1); rangeEnd.setDate(0);
  const totalDays = (rangeEnd-rangeStart)/86400000+1;

  hdr.innerHTML=`
    <div class="tl-label-col">프로젝트</div>
    <div class="tl-months">
      ${months.map(m=>{
        const isCur=m.getFullYear()===today.getFullYear()&&m.getMonth()===today.getMonth();
        return `<div class="tl-month${isCur?' current':''}">${m.getFullYear()}.${String(m.getMonth()+1).padStart(2,'0')}</div>`;
      }).join('')}
    </div>`;

  const todayPct = Math.max(0,Math.min(100,(today-rangeStart)/86400000/totalDays*100));

  body.innerHTML = projs.map(p=>{
    const stCfg = STATUS_CFG[p.status]||STATUS_CFG.planning;
    const pct   = p.progress||0;
    const pStart= p.start?new Date(p.start):null;
    const pEnd  = p.end  ?new Date(p.end)  :null;
    const members=(p.members||[]).slice(0,3).map(m=>
      `<div style="width:16px;height:16px;border-radius:50%;background:${memberColor(m)};display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:#fff;margin-left:-3px;" title="${m}">${initials(m)}</div>`
    ).join('');

    let barHtml='';
    if(pStart&&pEnd){
      const leftPct = Math.max(0,(pStart-rangeStart)/86400000/totalDays*100);
      const widthPct= Math.min(100-leftPct,(pEnd-pStart)/86400000/totalDays*100);
      const fillW   = widthPct*(pct/100);
      barHtml=`
        <div class="tl-bar-bg" style="left:${leftPct}%;width:${widthPct}%;background:${stCfg.color};" onclick="event.stopPropagation();openProjEditModal('${p.id}')">
          ${p.title.length>14?p.title.slice(0,12)+'…':p.title} ${pct}%
        </div>
        <div class="tl-bar-fill" style="left:${leftPct}%;width:${fillW}%;background:${pctColor(pct)};"></div>`;
    }

    return `
      <div class="tl-row" onclick="scrollToRow('${p.id}')">
        <div class="tl-info">
          <div class="tl-info-name" title="${p.title}">${p.title}</div>
          <div class="tl-info-sub">
            <span style="font-size:9px;padding:1px 5px;border-radius:5px;background:${stCfg.color}20;color:${stCfg.color};border:.5px solid ${stCfg.color}40;">${stCfg.label}</span>
            <span style="font-size:10px;font-weight:500;color:${pctColor(pct)};">${pct}%</span>
            <div style="display:flex;padding-left:3px;">${members}</div>
          </div>
        </div>
        <div class="tl-bars">
          <div class="tl-today-line" style="left:${todayPct}%"></div>
          ${barHtml}
        </div>
      </div>`;
  }).join('');
}

/* ── 테이블 ─────────────────────────────────────── */
function renderProjTable(){
  const projs    = filteredProjs();
  const comments = loadComments();
  const body     = document.getElementById('projTableBody');
  selectedIds.clear(); updateSelected();
  document.getElementById('checkAll').checked=false;
  if(!projs.length){
    body.innerHTML='<div class="table-empty"><i class="ti ti-mood-empty"></i>표시할 프로젝트가 없습니다.</div>'; return;
  }
  body.innerHTML = projs.map(p=>{
    const pct  = p.progress||0;
    const col  = pctColor(pct);
    const risk = riskLevel(p.end, p.status);
    const dl   = daysLeft(p.end);
    const dlTxt= dl===null?'—':dl<0?`${Math.abs(dl)}일 초과`:dl===0?'오늘 마감':`D-${dl}`;
    const dlCol= risk==='critical'?'color:#dc2626;':risk==='warning'?'color:#d97706;':'';
    const cList= comments[p.id]||[];
    const sel  = selectedIds.has(p.id);
    const tags = (p.tags||[]).slice(0,2).map(t=>`<span class="apt-tag">${t}</span>`).join('');
    return `
      <div class="apt-row${sel?' selected':''}" id="prow-${p.id}">
        <div class="apt-cell apt-check"><input type="checkbox" ${sel?'checked':''} onchange="toggleSelect('${p.id}',this.checked)" style="cursor:pointer;accent-color:#7c3aed;width:14px;height:14px;"/></div>
        <div class="apt-cell apt-title">
          <div class="apt-title-wrap">
            <div class="apt-title-text" title="${p.title}">${p.title}</div>
            <div class="apt-title-sub">${tags}</div>
          </div>
        </div>
        <div class="apt-cell apt-owner">
          <div class="apt-owner-wrap">
            <div class="apt-av" style="background:${memberColor(p.owner||'')};">${initials(p.owner||'?')}</div>
            <div class="apt-owner-name">${p.owner||'미배정'}</div>
          </div>
        </div>
        <div class="apt-cell apt-pri"><span class="pri-badge ${PRI_CFG[p.priority]?.cls||'pri-mid'}">${PRI_CFG[p.priority]?.label||'중간'}</span></div>
        <div class="apt-cell apt-status">
          <select class="apt-status-sel" onchange="changeStatus('${p.id}',this.value)">
            ${Object.entries(STATUS_CFG).map(([v,c])=>`<option value="${v}" ${p.status===v?'selected':''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="apt-cell apt-progress">
          <div class="apt-prog-wrap">
            <div class="apt-prog-top">
              <button class="apt-edit-prog" onclick="openProgressModal('${p.id}')" title="진행률 수정"><i class="ti ti-edit"></i><span style="font-size:10px;">${pct}%</span></button>
            </div>
            <div class="apt-prog-track"><div class="apt-prog-fill" style="width:${pct}%;background:${col};"></div></div>
          </div>
        </div>
        <div class="apt-cell apt-period">
          <div class="apt-period-wrap">
            <div class="apt-period-range">${formatDate(p.start)} ~ ${formatDate(p.end)}</div>
            <div class="apt-period-dl" style="${dlCol}">${dlTxt}</div>
          </div>
        </div>
        <div class="apt-cell apt-risk"><span class="risk-badge ${riskClass(risk)}"><i class="ti ${risk==='critical'?'ti-alert-triangle':risk==='warning'?'ti-alert-circle':'ti-circle-check'}" style="font-size:10px;"></i>${riskLabel(risk)}</span></div>
        <div class="apt-cell apt-comment">
          <div class="comment-count ${cList.length?'has-comment':''}" onclick="openCommentModal('${p.id}')">
            <i class="ti ti-message-circle"></i>${cList.length}
          </div>
        </div>
        <div class="apt-cell apt-actions">
          <div class="apt-action-btns">
            <button class="apt-btn edit"     onclick="openProjEditModal('${p.id}')" title="수정"><i class="ti ti-edit"></i></button>
            <button class="apt-btn progress" onclick="openProgressModal('${p.id}')" title="진행률 수정"><i class="ti ti-adjustments"></i></button>
            <button class="apt-btn comment"  onclick="openCommentModal('${p.id}')" title="코멘트"><i class="ti ti-message-plus"></i></button>
            <button class="apt-btn del"      onclick="openDeleteModal('${p.id}')" title="삭제"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── 선택 처리 ──────────────────────────────────── */
function toggleSelect(id,checked){
  if(checked) selectedIds.add(id); else selectedIds.delete(id);
  const row=document.getElementById('prow-'+id); if(row) row.classList.toggle('selected',checked);
  updateSelected();
  const projs=filteredProjs();
  document.getElementById('checkAll').checked=projs.length>0&&projs.every(p=>selectedIds.has(p.id));
}
function toggleAll(cb){
  filteredProjs().forEach(p=>{
    if(cb.checked) selectedIds.add(p.id); else selectedIds.delete(p.id);
    const row=document.getElementById('prow-'+p.id); if(row) row.classList.toggle('selected',cb.checked);
  });
  updateSelected();
}
function updateSelected(){
  const n=selectedIds.size;
  document.getElementById('selectedCount').textContent=`선택 ${n}건`;
  ['btnBulkDone','btnBulkReview','btnBulkHold'].forEach(id=>{ const el=document.getElementById(id); if(el) el.disabled=n===0; });
}

/* ── 상태 변경 ──────────────────────────────────── */
function changeStatus(id,newSt){
  const projs=loadProjs(); const idx=projs.findIndex(p=>p.id===id);
  if(idx>=0){ projs[idx].status=newSt; saveProjs(projs); }
  renderSummary(); renderRiskArea(); renderProjTable(); renderTimeline();
}
function bulkStatus(newSt){
  if(!selectedIds.size) return;
  const projs=loadProjs();
  projs.forEach(p=>{ if(selectedIds.has(p.id)) p.status=newSt; });
  saveProjs(projs); selectedIds.clear(); renderAll();
}

/* ── 행 스크롤 ──────────────────────────────────── */
function scrollToRow(id){
  const row=document.getElementById('prow-'+id);
  if(!row) return;
  row.scrollIntoView({behavior:'smooth',block:'center'});
  row.style.outline='2px solid var(--purple-t)';
  setTimeout(()=>row.style.outline='',2000);
}

/* ── Project 추가/수정 모달 ──────────────────────── */
function openProjModal(){
  document.getElementById('projModalTitle').textContent='Project 추가';
  document.getElementById('editProjId').value='';
  ['fpTitle','fpOwner','fpMembers','fpTags','fpDesc','fpMemo','fpStart','fpEnd'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fpStatus').value='planning';
  document.getElementById('fpPriority').value='mid';
  document.getElementById('fpProgress').value=0;
  updateProgBar();
  document.getElementById('projModalBackdrop').classList.add('open');
}
function openProjEditModal(id){
  const p=loadProjs().find(x=>x.id===id); if(!p) return;
  document.getElementById('projModalTitle').textContent='Project 수정';
  document.getElementById('editProjId').value=id;
  document.getElementById('fpTitle').value   =p.title;
  document.getElementById('fpStatus').value  =p.status;
  document.getElementById('fpPriority').value=p.priority||'mid';
  document.getElementById('fpProgress').value=p.progress||0;
  document.getElementById('fpStart').value   =p.start||'';
  document.getElementById('fpEnd').value     =p.end||'';
  document.getElementById('fpOwner').value   =p.owner||'';
  document.getElementById('fpMembers').value =(p.members||[]).join(', ');
  document.getElementById('fpTags').value    =(p.tags||[]).join(', ');
  document.getElementById('fpDesc').value    =p.desc||'';
  document.getElementById('fpMemo').value    =p.memo||'';
  updateProgBar();
  document.getElementById('projModalBackdrop').classList.add('open');
}
function closeProjModal(e){ if(e&&e.target!==document.getElementById('projModalBackdrop'))return; document.getElementById('projModalBackdrop').classList.remove('open'); }
document.getElementById('fpProgress').addEventListener('input',updateProgBar);
function updateProgBar(){
  const v=Math.min(100,Math.max(0,parseInt(document.getElementById('fpProgress').value)||0));
  const bar=document.getElementById('fpProgressBar');
  bar.style.width=v+'%'; bar.style.background=pctColor(v);
}
function saveProjAdmin(){
  const title=document.getElementById('fpTitle').value.trim();
  if(!title){ alert('프로젝트명을 입력해주세요.'); return; }
  const id=document.getElementById('editProjId').value||`p_${Date.now()}`;
  const rawMembers=document.getElementById('fpMembers').value;
  const rawTags=document.getElementById('fpTags').value;
  const proj={
    id, title,
    status:   document.getElementById('fpStatus').value,
    priority: document.getElementById('fpPriority').value,
    progress: Math.min(100,Math.max(0,parseInt(document.getElementById('fpProgress').value)||0)),
    start:    document.getElementById('fpStart').value,
    end:      document.getElementById('fpEnd').value,
    owner:    document.getElementById('fpOwner').value.trim(),
    members:  rawMembers?rawMembers.split(',').map(s=>s.trim()).filter(Boolean):[],
    tags:     rawTags   ?rawTags.split(',').map(s=>s.trim()).filter(Boolean):[],
    desc:     document.getElementById('fpDesc').value.trim(),
    memo:     document.getElementById('fpMemo').value.trim(),
    checklist:[],files:[],
    createdAt:new Date().toISOString().slice(0,10),
  };
  const projs=loadProjs(); const idx=projs.findIndex(p=>p.id===id);
  if(idx>=0){ proj.checklist=projs[idx].checklist||[]; proj.files=projs[idx].files||[]; projs[idx]=proj; }
  else projs.push(proj);
  saveProjs(projs);
  document.getElementById('projModalBackdrop').classList.remove('open');
  renderAll();
}

/* ── 진행률 수정 모달 ────────────────────────────── */
function openProgressModal(id){
  const p=loadProjs().find(x=>x.id===id); if(!p) return;
  progressTarget=id;
  document.getElementById('editProgressId').value=id;
  document.getElementById('progressProjInfo').textContent=p.title;
  document.getElementById('newProgress').value=p.progress||0;
  updateProgressPreview();
  document.getElementById('progressModalBackdrop').classList.add('open');
}
function closeProgressModal(e){ if(e&&e.target!==document.getElementById('progressModalBackdrop'))return; document.getElementById('progressModalBackdrop').classList.remove('open'); }
document.getElementById('newProgress').addEventListener('input',updateProgressPreview);
function updateProgressPreview(){
  const v=Math.min(100,Math.max(0,parseInt(document.getElementById('newProgress').value)||0));
  const col=pctColor(v);
  document.getElementById('progressPreviewBar').style.width=v+'%';
  document.getElementById('progressPreviewBar').style.background=col;
  document.getElementById('progressPreviewPct').textContent=v+'%';
  document.getElementById('progressPreviewPct').style.color=col;
}
function saveProgress(){
  const id=document.getElementById('editProgressId').value;
  const v =Math.min(100,Math.max(0,parseInt(document.getElementById('newProgress').value)||0));
  const projs=loadProjs(); const idx=projs.findIndex(p=>p.id===id);
  if(idx>=0){ projs[idx].progress=v; saveProjs(projs); }
  document.getElementById('progressModalBackdrop').classList.remove('open');
  renderAll();
}

/* ── 코멘트 모달 ─────────────────────────────────── */
function openCommentModal(projId){
  commentTarget=projId;
  const p=loadProjs().find(x=>x.id===projId);
  document.getElementById('commentProjId').value=projId;
  document.getElementById('commentProjInfo').textContent=p?`${p.title} · ${p.owner||'미배정'}`:'';
  document.getElementById('commentText').value='';
  document.getElementById('commentType').value='comment';
  document.getElementById('commentStatus').value='';
  renderCommentThread(projId);
  document.getElementById('commentModalBackdrop').classList.add('open');
}
function closeCommentModal(e){ if(e&&e.target!==document.getElementById('commentModalBackdrop'))return; document.getElementById('commentModalBackdrop').classList.remove('open'); }
function renderCommentThread(projId){
  const comments=loadComments(); const list=(comments[projId]||[]).slice().reverse();
  const el=document.getElementById('commentThread');
  if(!list.length){ el.innerHTML='<div style="font-size:11px;color:var(--text-sec);padding:8px 0;">아직 코멘트가 없습니다.</div>'; return; }
  el.innerHTML=list.map((c,ri)=>{
    const idx=(comments[projId]||[]).length-1-ri;
    const tCfg=CMT_TYPE[c.type]||CMT_TYPE.comment;
    return `
      <div class="ct-bubble">
        <div class="ct-av" style="background:${memberColor(c.author||'관')}">${initials(c.author||'관')}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:3px;">
            <span class="ct-name">${c.author||'관리자'}</span>
            <span class="ctype-badge ${tCfg.cls}">${tCfg.label}</span>
            <span style="font-size:10px;color:var(--sb-muted);margin-left:auto;">${timeAgo(c.ts)}</span>
            <button class="ct-del-btn" onclick="deleteComment('${projId}',${idx})" title="삭제">✕</button>
          </div>
          <div class="ct-text">${c.text}</div>
        </div>
      </div>`;
  }).join('');
}
function deleteComment(projId,idx){
  const c=loadComments(); if(c[projId]) c[projId].splice(idx,1); saveComments(c);
  renderCommentThread(projId); renderCommentFeed(); renderProjTable();
}
function submitComment(){
  const text=document.getElementById('commentText').value.trim();
  if(!text){ alert('코멘트 내용을 입력해주세요.'); return; }
  const projId=document.getElementById('commentProjId').value;
  const type  =document.getElementById('commentType').value;
  const newSt =document.getElementById('commentStatus').value;
  const c=loadComments(); if(!c[projId]) c[projId]=[];
  c[projId].push({ id:`c_${Date.now()}`, author:'손대훈', type, text, ts:new Date().toISOString() });
  saveComments(c);
  if(newSt){ const projs=loadProjs(); const idx=projs.findIndex(p=>p.id===projId); if(idx>=0){ projs[idx].status=newSt; saveProjs(projs); } }
  document.getElementById('commentText').value='';
  renderCommentThread(projId); renderAll();
}

/* ── 삭제 모달 ──────────────────────────────────── */
function openDeleteModal(id){ deleteTarget=id; document.getElementById('deleteModalBackdrop').classList.add('open'); }
function closeDeleteModal(e){ if(e&&e.target!==document.getElementById('deleteModalBackdrop'))return; document.getElementById('deleteModalBackdrop').classList.remove('open'); deleteTarget=null; }
function confirmDelete(){
  if(!deleteTarget) return;
  const projs=loadProjs().filter(p=>p.id!==deleteTarget); saveProjs(projs);
  const c=loadComments(); delete c[deleteTarget]; saveComments(c);
  deleteTarget=null;
  document.getElementById('deleteModalBackdrop').classList.remove('open');
  renderAll();
}

/* ── 검색 ───────────────────────────────────────── */
document.getElementById('projSearch').addEventListener('input',()=>{ renderProjTable(); renderTimeline(); });

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
