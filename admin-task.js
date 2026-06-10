/* =====================================================
   INSPIRE — admin-task.js
===================================================== */
const TASK_KEY        = 'inspire_tasks';
const TASK_COMMENT_KEY= 'inspire_task_comments';

const TEAM_MEMBERS = [
  { name:'손대훈',  color:'#7c3aed' },
  { name:'김아무개',color:'#2563eb' },
  { name:'이담당',  color:'#0f766e' },
  { name:'박야간',  color:'#b45309' },
];
const STATUS_CFG = {
  todo:  { label:'할 일',  color:'#94a3b8', cls:'st-todo' },
  doing: { label:'진행중', color:'#2563eb', cls:'st-doing' },
  review:{ label:'검토중', color:'#d97706', cls:'st-review' },
  done:  { label:'완료',   color:'#16a34a', cls:'st-done' },
  hold:  { label:'보류',   color:'#dc2626', cls:'st-hold' },
};
const PRI_CFG = {
  high:{ label:'높음', cls:'pri-high' },
  mid: { label:'중간', cls:'pri-mid' },
  low: { label:'낮음', cls:'pri-low' },
};
const COMMENT_TYPE = {
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
function riskLevel(dueDate, status){
  if(!dueDate||status==='done'||status==='hold') return 'none';
  const dl = daysLeft(dueDate);
  if(dl===null) return 'none';
  if(dl < 0)  return 'critical';
  if(dl <= 1) return 'critical';
  if(dl <= 3) return 'warning';
  return 'safe';
}
function riskLabel(lvl){ return {critical:'긴급',warning:'주의',safe:'정상',none:'—'}[lvl]||'—'; }
function riskClass(lvl){ return {critical:'risk-critical',warning:'risk-warning',safe:'risk-safe',none:'risk-none'}[lvl]||'risk-none'; }
function clProg(cl){ if(!cl||!cl.length)return null; const d=cl.filter(c=>c.done).length; return {done:d,total:cl.length,pct:Math.round(d/cl.length*100)}; }

/* ── Storage ───────────────────────────────────── */
function loadTasks()   { try{ return JSON.parse(localStorage.getItem(TASK_KEY)||'[]'); }catch{ return []; } }
function saveTasks(d)  { localStorage.setItem(TASK_KEY, JSON.stringify(d)); }
function loadComments(){ try{ return JSON.parse(localStorage.getItem(TASK_COMMENT_KEY)||'{}'); }catch{ return {}; } }
function saveComments(d){ localStorage.setItem(TASK_COMMENT_KEY, JSON.stringify(d)); }

/* ── State ─────────────────────────────────────── */
let selectedIds    = new Set();
let deleteTargetId = null;
let commentTaskId  = null;

/* ── Filter ─────────────────────────────────────── */
function filteredTasks(){
  const tasks  = loadTasks();
  const q      = (document.getElementById('taskAdminSearch')?.value||'').toLowerCase();
  const asgn   = document.getElementById('assigneeFilter')?.value||'all';
  const st     = document.getElementById('statusFilter')?.value||'all';
  const pri    = document.getElementById('priFilter')?.value||'all';
  const risk   = document.getElementById('riskFilter')?.value||'all';
  const sort   = document.getElementById('sortTask')?.value||'due';

  let result = tasks.filter(t=>{
    if(asgn!=='all' && t.assignee!==asgn) return false;
    if(st!=='all'   && t.status!==st)     return false;
    if(pri!=='all'  && t.priority!==pri)  return false;
    if(risk!=='all' && riskLevel(t.due, t.status)!==risk) return false;
    if(q && !t.title.toLowerCase().includes(q) && !(t.assignee||'').toLowerCase().includes(q)) return false;
    return true;
  });

  result.sort((a,b)=>{
    if(sort==='due')      return (a.due||'9999').localeCompare(b.due||'9999');
    if(sort==='assignee') return (a.assignee||'').localeCompare(b.assignee||'','ko');
    if(sort==='priority'){ const O={high:0,mid:1,low:2}; return (O[a.priority]??1)-(O[b.priority]??1); }
    return (a.createdAt||'').localeCompare(b.createdAt||'');
  });
  return result;
}

/* ── Render All ─────────────────────────────────── */
function renderAll(){
  renderSummary();
  renderMemberChart();
  renderRiskArea();
  renderCommentFeed();
  renderTaskTable();
  populateFilters();
  updateSelectedCount();
}

/* ── Summary ────────────────────────────────────── */
function renderSummary(){
  const tasks = loadTasks();
  const cnt   = { todo:0,doing:0,review:0,done:0,hold:0 };
  tasks.forEach(t=>{ if(cnt[t.status]!==undefined) cnt[t.status]++; });
  const critical = tasks.filter(t=>riskLevel(t.due,t.status)==='critical').length;
  const defs=[
    { ic:'ti-checkbox',      cls:'purple', label:'전체 Task',    val:tasks.length+'건', sub:'' },
    { ic:'ti-player-play',   cls:'blue',   label:'진행중',       val:cnt.doing+'건',    sub:'' },
    { ic:'ti-eye',           cls:'amber',  label:'검토 대기',    val:cnt.review+'건',   sub:'승인 대기' },
    { ic:'ti-circle-check',  cls:'green',  label:'완료',         val:cnt.done+'건',     sub:'' },
    { ic:'ti-alert-triangle',cls:'red',    label:'긴급 마감',    val:critical+'건',     sub:'1일 이내' },
    { ic:'ti-player-pause',  cls:'gray',   label:'보류',         val:cnt.hold+'건',     sub:'' },
  ];
  document.getElementById('atSummary').innerHTML = defs.map(d=>`
    <div class="ats-card">
      <div class="ats-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div><div class="ats-label">${d.label}</div><div class="ats-val">${d.val}</div>${d.sub?`<div class="ats-sub">${d.sub}</div>`:''}</div>
    </div>`).join('');
  document.getElementById('totalTaskBadge').textContent = tasks.length;
}

/* ── 사원별 Task 비교 차트 ──────────────────────── */
function renderMemberChart(){
  const tasks = loadTasks();
  const area  = document.getElementById('memberTaskArea');
  const colors= { todo:'#94a3b8', doing:'#2563eb', review:'#d97706', done:'#16a34a', hold:'#dc2626' };

  const rows = TEAM_MEMBERS.map(m=>{
    const mTasks = tasks.filter(t=>t.assignee===m.name);
    if(!mTasks.length) return '';
    const cnt = { todo:0,doing:0,review:0,done:0,hold:0 };
    mTasks.forEach(t=>{ if(cnt[t.status]!==undefined) cnt[t.status]++; });
    const total = mTasks.length;
    const segs  = Object.entries(cnt).map(([k,v])=>
      v>0?`<div class="mt-seg" style="width:${v/total*100}%;background:${colors[k]};" title="${STATUS_CFG[k]?.label} ${v}건"></div>`:''
    ).join('');
    return `
      <div class="mt-row">
        <div class="mt-av" style="background:${m.color};">${initials(m.name)}</div>
        <div class="mt-info">
          <div class="mt-name"><span>${m.name}</span><span class="mt-count">${total}건</span></div>
          <div class="mt-stacked">${segs}</div>
        </div>
      </div>`;
  }).filter(Boolean).join('');

  area.innerHTML = rows || '<div style="padding:20px;text-align:center;font-size:11px;color:var(--text-sec);">Task 없음</div>';

  // 범례 (한 번만)
  const existing = document.querySelector('.mt-legend');
  if(existing) existing.remove();
  area.insertAdjacentHTML('afterend',`
    <div class="mt-legend">
      ${Object.entries(STATUS_CFG).map(([k,v])=>`<div class="mt-leg-item"><div class="mt-leg-dot" style="background:${v.color};"></div>${v.label}</div>`).join('')}
    </div>`);
}

/* ── 마감 위험도 ─────────────────────────────────── */
function renderRiskArea(){
  const tasks = loadTasks();
  const area  = document.getElementById('riskArea');
  const risky = tasks
    .filter(t=>riskLevel(t.due,t.status)!=='none'&&riskLevel(t.due,t.status)!=='safe')
    .map(t=>({...t,risk:riskLevel(t.due,t.status),dl:daysLeft(t.due)}))
    .sort((a,b)=>{ const O={critical:0,warning:1}; return O[a.risk]-O[b.risk]||a.dl-b.dl; })
    .slice(0,8);

  const safe = tasks.filter(t=>riskLevel(t.due,t.status)==='safe').slice(0,2);
  document.getElementById('riskBadge').textContent = risky.length;

  if(!risky.length && !safe.length){
    area.innerHTML='<div class="risk-empty"><i class="ti ti-mood-happy"></i>위험 Task 없음</div>'; return;
  }

  area.innerHTML = [
    ...risky.map(t=>{
      const dlTxt = t.dl<0?`${Math.abs(t.dl)}일 초과`:t.dl===0?'오늘 마감':`D-${t.dl}`;
      return `<div class="risk-item ${t.risk}" onclick="highlightRow('${t.id}')">
        <i class="ti ${t.risk==='critical'?'ti-alert-triangle':'ti-alert-circle'} risk-icon"></i>
        <div>
          <div class="risk-title">${t.title}</div>
          <div class="risk-meta">${dlTxt} · ${t.assignee||'미배정'} · ${STATUS_CFG[t.status]?.label||''}</div>
        </div>
      </div>`;
    }),
    ...safe.map(t=>`<div class="risk-item safe" onclick="highlightRow('${t.id}')">
      <i class="ti ti-circle-check risk-icon"></i>
      <div><div class="risk-title">${t.title}</div><div class="risk-meta">D-${daysLeft(t.due)} · ${t.assignee||'미배정'}</div></div>
    </div>`)
  ].join('');
}

/* ── 코멘트 피드 ─────────────────────────────────── */
function renderCommentFeed(){
  const tasks    = loadTasks();
  const comments = loadComments();
  const all = [];
  Object.entries(comments).forEach(([tid, list])=>{
    const task = tasks.find(t=>t.id===tid);
    (list||[]).forEach(c=>all.push({...c, taskTitle:task?.title||tid, taskId:tid}));
  });
  all.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  const top = all.slice(0,8);
  document.getElementById('commentBadge').textContent = all.length;
  const feed = document.getElementById('commentFeed');
  if(!top.length){
    feed.innerHTML='<div class="cf-empty"><i class="ti ti-message-off"></i>코멘트 없음</div>'; return;
  }
  feed.innerHTML = top.map(c=>{
    const tCfg = COMMENT_TYPE[c.type]||COMMENT_TYPE.comment;
    return `
      <div class="cf-item" onclick="openCommentModal('${c.taskId}')">
        <div class="cf-av" style="background:${memberColor(c.author||'관')}">${initials(c.author||'관')}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
            <span class="cf-author">${c.author||'관리자'}</span>
            <span class="ctype-badge ${tCfg.cls}">${tCfg.label}</span>
          </div>
          <div class="cf-task">${c.taskTitle}</div>
          <div class="cf-text">${c.text}</div>
          <div class="cf-time">${timeAgo(c.ts)}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── Task Table ──────────────────────────────────── */
function renderTaskTable(){
  const tasks    = filteredTasks();
  const comments = loadComments();
  const body     = document.getElementById('taskTableBody');
  selectedIds.clear(); updateSelectedCount();
  document.getElementById('checkAll').checked = false;

  if(!tasks.length){
    body.innerHTML='<div class="table-empty"><i class="ti ti-mood-empty"></i>표시할 Task가 없습니다.</div>'; return;
  }

  body.innerHTML = tasks.map(t=>{
    const risk   = riskLevel(t.due, t.status);
    const dl     = daysLeft(t.due);
    const dlTxt  = dl===null?'—':dl<0?`${Math.abs(dl)}일 초과`:dl===0?'오늘 마감':`D-${dl}`;
    const dlColor= risk==='critical'?'color:#dc2626;':risk==='warning'?'color:#d97706;':'';
    const cl     = clProg(t.checklist);
    const cList  = comments[t.id]||[];
    const selected = selectedIds.has(t.id);
    const tags   = (t.tags||[]).slice(0,2).map(tag=>`<span class="att-tag">${tag}</span>`).join('');

    return `
      <div class="att-row${selected?' selected':''}" id="row-${t.id}">
        <div class="att-cell att-check"><input type="checkbox" ${selected?'checked':''} onchange="toggleSelect('${t.id}',this.checked)" style="cursor:pointer;accent-color:#7c3aed;width:14px;height:14px;"/></div>
        <div class="att-cell att-assignee">
          <div class="att-av-wrap">
            <div class="att-av" style="background:${memberColor(t.assignee||'')};">${initials(t.assignee||'?')}</div>
            <div class="att-name-sm">${t.assignee||'미배정'}</div>
          </div>
        </div>
        <div class="att-cell att-title">
          <div class="att-title-wrap">
            <div class="att-title-text" title="${t.title}">${t.title}</div>
            ${tags?`<div class="att-title-tags">${tags}</div>`:''}
          </div>
        </div>
        <div class="att-cell att-pri"><span class="pri-badge ${PRI_CFG[t.priority]?.cls||'pri-mid'}">${PRI_CFG[t.priority]?.label||'중간'}</span></div>
        <div class="att-cell att-status">
          <select class="att-status-sel" onchange="changeStatus('${t.id}',this.value)">
            ${Object.entries(STATUS_CFG).map(([v,c])=>`<option value="${v}" ${t.status===v?'selected':''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="att-cell att-due">
          <div class="due-cell">
            <div class="due-text" style="${dlColor}">${dlTxt}</div>
            <div class="due-date">${formatDate(t.due)}</div>
          </div>
        </div>
        <div class="att-cell att-risk"><span class="risk-badge ${riskClass(risk)}"><i class="ti ${risk==='critical'?'ti-alert-triangle':risk==='warning'?'ti-alert-circle':'ti-circle-check'}" style="font-size:10px;"></i>${riskLabel(risk)}</span></div>
        <div class="att-cell att-progress">
          ${cl
            ? `<div class="cl-prog"><div class="cl-track"><div class="cl-fill" style="width:${cl.pct}%;"></div></div><span class="cl-txt">${cl.done}/${cl.total}</span></div>`
            : '<span style="font-size:10px;color:var(--sb-muted);">—</span>'}
        </div>
        <div class="att-cell att-comment">
          <div class="comment-count ${cList.length?'has-comment':''}" onclick="openCommentModal('${t.id}')">
            <i class="ti ti-message-circle"></i>${cList.length}
          </div>
        </div>
        <div class="att-cell att-actions">
          <div class="att-action-btns">
            <button class="att-btn edit"    onclick="openTaskEditModal('${t.id}')" title="수정"><i class="ti ti-edit"></i></button>
            <button class="att-btn comment" onclick="openCommentModal('${t.id}')" title="코멘트"><i class="ti ti-message-plus"></i></button>
            <button class="att-btn del"     onclick="openDeleteModal('${t.id}')"  title="삭제"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── 행 하이라이트 ───────────────────────────────── */
function highlightRow(id){
  const row = document.getElementById('row-'+id);
  if(!row) return;
  row.scrollIntoView({behavior:'smooth',block:'center'});
  row.style.outline = '2px solid var(--purple-t)';
  setTimeout(()=>row.style.outline='', 2000);
}

/* ── 선택 처리 ──────────────────────────────────── */
function toggleSelect(id, checked){
  if(checked) selectedIds.add(id); else selectedIds.delete(id);
  const row = document.getElementById('row-'+id);
  if(row) row.classList.toggle('selected', checked);
  updateSelectedCount();
  const tasks = filteredTasks();
  document.getElementById('checkAll').checked = tasks.length>0 && tasks.every(t=>selectedIds.has(t.id));
}
function toggleAll(cb){
  filteredTasks().forEach(t=>{
    if(cb.checked) selectedIds.add(t.id); else selectedIds.delete(t.id);
    const row = document.getElementById('row-'+t.id);
    if(row) row.classList.toggle('selected', cb.checked);
  });
  updateSelectedCount();
}
function updateSelectedCount(){
  const n = selectedIds.size;
  document.getElementById('selectedCount').textContent = `선택 ${n}건`;
  ['btnBulkDone','btnBulkReview','btnBulkHold','btnReassign'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.disabled = n===0;
  });
}

/* ── 상태 변경 ──────────────────────────────────── */
function changeStatus(id, newStatus){
  const tasks = loadTasks();
  const idx   = tasks.findIndex(t=>t.id===id);
  if(idx>=0){ tasks[idx].status=newStatus; saveTasks(tasks); }
  renderSummary(); renderRiskArea(); renderTaskTable();
}
function bulkStatusChange(newStatus){
  if(!selectedIds.size) return;
  const tasks = loadTasks();
  tasks.forEach(t=>{ if(selectedIds.has(t.id)) t.status=newStatus; });
  saveTasks(tasks);
  selectedIds.clear();
  renderAll();
}

/* ── 담당자 재배정 ───────────────────────────────── */
function openReassignModal(){
  if(!selectedIds.size) return;
  document.getElementById('reassignInfo').textContent = `선택된 Task ${selectedIds.size}건에 담당자를 재배정합니다.`;
  document.getElementById('reassignBackdrop').classList.add('open');
}
function closeReassignModal(e){
  if(e&&e.target!==document.getElementById('reassignBackdrop')) return;
  document.getElementById('reassignBackdrop').classList.remove('open');
}
function confirmReassign(){
  const newAsgn = document.getElementById('newAssignee').value;
  if(!newAsgn){ alert('새 담당자를 선택해주세요.'); return; }
  const tasks = loadTasks();
  tasks.forEach(t=>{ if(selectedIds.has(t.id)) t.assignee=newAsgn; });
  saveTasks(tasks);
  selectedIds.clear();
  document.getElementById('reassignBackdrop').classList.remove('open');
  renderAll();
}

/* ── Task 추가/수정 모달 ─────────────────────────── */
function openTaskAddModal(){
  document.getElementById('taskModalTitle').textContent = 'Task 추가';
  document.getElementById('editTaskId').value = '';
  ['ftTitle','ftDue','ftTags','ftDesc','ftMemo'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ftPriority').value = 'mid';
  document.getElementById('ftStatus').value   = 'todo';
  document.getElementById('ftAssignee').value = '';
  document.getElementById('taskModalBackdrop').classList.add('open');
}
function openTaskEditModal(id){
  const t = loadTasks().find(x=>x.id===id); if(!t) return;
  document.getElementById('taskModalTitle').textContent = 'Task 수정';
  document.getElementById('editTaskId').value    = id;
  document.getElementById('ftTitle').value       = t.title;
  document.getElementById('ftAssignee').value    = t.assignee||'';
  document.getElementById('ftPriority').value    = t.priority||'mid';
  document.getElementById('ftStatus').value      = t.status||'todo';
  document.getElementById('ftDue').value         = t.due||'';
  document.getElementById('ftTags').value        = (t.tags||[]).join(', ');
  document.getElementById('ftDesc').value        = t.desc||'';
  document.getElementById('ftMemo').value        = t.memo||'';
  document.getElementById('taskModalBackdrop').classList.add('open');
}
function closeTaskModal(e){
  if(e&&e.target!==document.getElementById('taskModalBackdrop')) return;
  document.getElementById('taskModalBackdrop').classList.remove('open');
}
function saveTaskAdmin(){
  const title = document.getElementById('ftTitle').value.trim();
  if(!title){ alert('제목을 입력해주세요.'); return; }
  const id = document.getElementById('editTaskId').value || `t_${Date.now()}`;
  const rawTags = document.getElementById('ftTags').value;
  const task = {
    id, title,
    assignee: document.getElementById('ftAssignee').value,
    priority: document.getElementById('ftPriority').value,
    status:   document.getElementById('ftStatus').value,
    due:      document.getElementById('ftDue').value,
    tags:     rawTags?rawTags.split(',').map(s=>s.trim()).filter(Boolean):[],
    desc:     document.getElementById('ftDesc').value.trim(),
    memo:     document.getElementById('ftMemo').value.trim(),
    checklist:[], files:[],
    createdAt:new Date().toISOString().slice(0,10),
  };
  const tasks = loadTasks();
  const idx   = tasks.findIndex(t=>t.id===id);
  if(idx>=0){ task.checklist=tasks[idx].checklist||[]; task.files=tasks[idx].files||[]; tasks[idx]=task; }
  else tasks.push(task);
  saveTasks(tasks);
  document.getElementById('taskModalBackdrop').classList.remove('open');
  renderAll();
}

/* ── 코멘트 모달 ─────────────────────────────────── */
function openCommentModal(taskId){
  commentTaskId = taskId;
  const task = loadTasks().find(t=>t.id===taskId);
  document.getElementById('commentTaskId').value       = taskId;
  document.getElementById('commentTaskInfo').textContent= task?`${task.title} · ${task.assignee||'미배정'}`:'';
  document.getElementById('commentText').value         = '';
  document.getElementById('commentType').value         = 'comment';
  document.getElementById('commentStatusChange').value = '';
  renderCommentThread(taskId);
  document.getElementById('commentBackdrop').classList.add('open');
}
function closeCommentModal(e){
  if(e&&e.target!==document.getElementById('commentBackdrop')) return;
  document.getElementById('commentBackdrop').classList.remove('open');
}
function renderCommentThread(taskId){
  const comments = loadComments();
  const list     = (comments[taskId]||[]).slice().reverse();
  const el       = document.getElementById('commentThread');
  if(!list.length){ el.innerHTML='<div style="font-size:11px;color:var(--text-sec);padding:8px 0;">아직 코멘트가 없습니다.</div>'; return; }
  el.innerHTML = list.map((c,ri)=>{
    const idx = (comments[taskId]||[]).length-1-ri;
    const tCfg= COMMENT_TYPE[c.type]||COMMENT_TYPE.comment;
    return `
      <div class="ct-bubble">
        <div class="ct-av" style="background:${memberColor(c.author||'관')}">${initials(c.author||'관')}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:3px;">
            <span class="ct-name">${c.author||'관리자'}</span>
            <span class="ctype-badge ${tCfg.cls}">${tCfg.label}</span>
            <span style="font-size:10px;color:var(--sb-muted);margin-left:auto;">${timeAgo(c.ts)}</span>
            <button class="ct-del-btn" onclick="deleteComment('${taskId}',${idx})" title="삭제">✕</button>
          </div>
          <div class="ct-text">${c.text}</div>
        </div>
      </div>`;
  }).join('');
}
function deleteComment(taskId, idx){
  const comments = loadComments();
  if(comments[taskId]) comments[taskId].splice(idx,1);
  saveComments(comments);
  renderCommentThread(taskId);
  renderCommentFeed(); renderTaskTable();
}
function submitComment(){
  const text = document.getElementById('commentText').value.trim();
  if(!text){ alert('코멘트 내용을 입력해주세요.'); return; }
  const taskId     = document.getElementById('commentTaskId').value;
  const type       = document.getElementById('commentType').value;
  const newStatus  = document.getElementById('commentStatusChange').value;
  const comments   = loadComments();
  if(!comments[taskId]) comments[taskId]=[];
  comments[taskId].push({ id:`c_${Date.now()}`, author:'손대훈', type, text, ts:new Date().toISOString() });
  saveComments(comments);
  if(newStatus){
    const tasks = loadTasks();
    const idx   = tasks.findIndex(t=>t.id===taskId);
    if(idx>=0){ tasks[idx].status=newStatus; saveTasks(tasks); }
  }
  document.getElementById('commentText').value='';
  renderCommentThread(taskId);
  renderAll();
}

/* ── 삭제 모달 ──────────────────────────────────── */
function openDeleteModal(id){ deleteTargetId=id; document.getElementById('deleteBackdrop').classList.add('open'); }
function closeDeleteModal(e){ if(e&&e.target!==document.getElementById('deleteBackdrop'))return; document.getElementById('deleteBackdrop').classList.remove('open'); deleteTargetId=null; }
function confirmDelete(){
  if(!deleteTargetId) return;
  const tasks = loadTasks().filter(t=>t.id!==deleteTargetId);
  saveTasks(tasks);
  const comments = loadComments(); delete comments[deleteTargetId]; saveComments(comments);
  deleteTargetId=null;
  document.getElementById('deleteBackdrop').classList.remove('open');
  renderAll();
}

/* ── 필터 초기화 ─────────────────────────────────── */
function populateFilters(){
  ['assigneeFilter','newAssignee','ftAssignee'].forEach(selId=>{
    const sel = document.getElementById(selId); if(!sel) return;
    if(sel.options.length > 1) return;
    TEAM_MEMBERS.forEach(m=>{ const o=document.createElement('option'); o.value=m.name; o.textContent=m.name; sel.appendChild(o); });
  });
}

/* ── 검색 ───────────────────────────────────────── */
document.getElementById('taskAdminSearch').addEventListener('input',()=>renderTaskTable());

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
