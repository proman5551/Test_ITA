/* =====================================================
   INSPIRE — task.js
===================================================== */

/* task.js — INSPIRE Task Page */
const TASK_KEY = 'inspire_tasks';

/* ── 초기 샘플 데이터 ─────────────────────────────────────────── */
const INITIAL_TASKS = [
  { id:'t1', title:'B동 무단침입 사건보고서 작성', priority:'high', status:'doing',
    due:'2025-06-06', assignee:'손대훈', tags:['사건보고','긴급'],
    desc:'B동 14:30 무단침입 건 보고서 최종 작성 및 팀장 결재 요청',
    checklist:[{text:'현장 사진 첨부',done:true},{text:'목격자 진술 정리',done:true},{text:'보고서 초안 작성',done:false},{text:'팀장 결재',done:false}],
    files:['현장사진_B동.jpg'], memo:'경찰 신고 여부 확인 필요', createdAt:'2025-06-06' },
  { id:'t2', title:'CCTV A구역 정기 점검', priority:'mid', status:'done',
    due:'2025-06-06', assignee:'손대훈', tags:['CCTV','정기점검'],
    desc:'A구역 전체 CCTV 화질 및 녹화 상태 점검',
    checklist:[{text:'카메라 1~5번 확인',done:true},{text:'녹화 스토리지 확인',done:true},{text:'이상 유무 보고',done:true}],
    files:[], memo:'', createdAt:'2025-06-05' },
  { id:'t3', title:'야간 인수인계 문서 작성', priority:'mid', status:'todo',
    due:'2025-06-06', assignee:'손대훈', tags:['인수인계'],
    desc:'18:00 야간조 인수인계 문서 작성 및 서명',
    checklist:[{text:'특이사항 정리',done:false},{text:'장비 현황 확인',done:false},{text:'서명 완료',done:false}],
    files:[], memo:'B동 모니터링 내용 포함', createdAt:'2025-06-06' },
  { id:'t4', title:'데일리 로그 마감 입력', priority:'low', status:'todo',
    due:'2025-06-06', assignee:'손대훈', tags:['데일리로그'],
    desc:'금일 업무 전체 데일리 로그 작성 및 마감',
    checklist:[{text:'오전 업무 기록',done:true},{text:'오후 업무 기록',done:false}],
    files:[], memo:'', createdAt:'2025-06-06' },
  { id:'t5', title:'주차장 CCTV 화질 저하 조치', priority:'high', status:'review',
    due:'2025-06-07', assignee:'이담당', tags:['CCTV','장비'],
    desc:'주차장 A구역 CCTV 화질 저하 원인 파악 및 교체 요청',
    checklist:[{text:'원인 파악',done:true},{text:'업체 연락',done:false},{text:'교체 일정 확정',done:false}],
    files:['CCTV_불량보고.pdf'], memo:'업체 연락처: 02-1234-5678', createdAt:'2025-06-05' },
  { id:'t6', title:'경찰영장 공문 초안 작성', priority:'mid', status:'hold',
    due:'2025-06-09', assignee:'손대훈', tags:['공문','경찰'],
    desc:'B동 무단침입 관련 경찰 영장 공문 작성',
    checklist:[{text:'법무팀 검토 요청',done:false},{text:'공문 초안 작성',done:false}],
    files:[], memo:'법무팀 확인 후 진행', createdAt:'2025-06-06' },
];

/* ── 상태/우선순위 설정 ──────────────────────────────────────── */
const STATUS_CONFIG = {
  todo:   { label:'To Do',     color:'#94a3b8', colClass:'st-todo',  countClass:'badge-gray',   bgClass:'gray' },
  doing:  { label:'In Progress',color:'#2563eb', colClass:'st-doing', countClass:'badge-blue',   bgClass:'blue' },
  review: { label:'검토중',     color:'#d97706', colClass:'st-review',countClass:'badge-warn',   bgClass:'amber' },
  done:   { label:'완료',       color:'#16a34a', colClass:'st-done',  countClass:'badge-ok',     bgClass:'green' },
  hold:   { label:'보류',       color:'#dc2626', colClass:'st-hold',  countClass:'badge-danger', bgClass:'red' },
};
const PRI_CONFIG = {
  high: { label:'높음', dot:'pri-dot-h', badge:'pri-high', color:'#dc2626' },
  mid:  { label:'중간', dot:'pri-dot-m', badge:'pri-mid',  color:'#d97706' },
  low:  { label:'낮음', dot:'pri-dot-l', badge:'pri-low',  color:'#16a34a' },
};

/* ── State ───────────────────────────────────────────────────── */
let tasks       = JSON.parse(localStorage.getItem(TASK_KEY) || 'null') || JSON.parse(JSON.stringify(INITIAL_TASKS));
let currentView = 'kanban';
let editingCL   = [];
let editingFiles= [];
let deleteTarget= null;

function saveTasks(){ localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); }

/* ── Helpers ─────────────────────────────────────────────────── */
function daysLeft(d){ if(!d) return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function formatDate(d){ return d?d.replace(/-/g,'.'):''; }
function clProgress(cl){ if(!cl||!cl.length) return null; const d=cl.filter(c=>c.done).length; return {done:d,total:cl.length,pct:Math.round(d/cl.length*100)}; }
function filtered(){
  const q   = (document.getElementById('taskSearch')?.value||'').toLowerCase();
  const pri = document.getElementById('priFilter')?.value||'all';
  const asgn= document.getElementById('assignFilter')?.value||'all';
  return tasks.filter(t=>{
    if(pri!=='all' && t.priority!==pri) return false;
    if(asgn!=='all' && t.assignee!==asgn) return false;
    if(q && !t.title.toLowerCase().includes(q) && !(t.assignee||'').toLowerCase().includes(q)) return false;
    return true;
  });
}

/* ── View Switch ─────────────────────────────────────────────── */
function switchView(v){
  currentView = v;
  document.getElementById('kanbanView').style.display = v==='kanban'?'flex':'none';
  document.getElementById('listView').style.display   = v==='list'  ?'block':'none';
  document.getElementById('tabKanban').classList.toggle('active', v==='kanban');
  document.getElementById('tabList').classList.toggle('active',   v==='list');
  renderAll();
}

/* ── Render All ──────────────────────────────────────────────── */
function renderAll(){
  saveTasks();
  renderSummary();
  renderKanban();
  renderList();
  renderRightPanel();
  document.getElementById('sbTaskCount').textContent = tasks.filter(t=>t.status!=='done').length;
}

/* ── Summary Strip ───────────────────────────────────────────── */
function renderSummary(){
  const counts={ todo:0, doing:0, review:0, done:0, hold:0 };
  tasks.forEach(t=>{ if(counts[t.status]!==undefined) counts[t.status]++; });
  const defs=[
    {key:'todo',  label:'할 일', ic:'ti-circle',       cls:'gray'},
    {key:'doing', label:'진행중', ic:'ti-player-play',  cls:'blue'},
    {key:'review',label:'검토중', ic:'ti-eye',          cls:'amber'},
    {key:'done',  label:'완료',  ic:'ti-check',         cls:'green'},
    {key:'hold',  label:'보류',  ic:'ti-player-pause',  cls:'red'},
  ];
  document.getElementById('taskSummary').innerHTML = defs.map(d=>`
    <div class="ts-card">
      <div class="ts-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div class="ts-body"><div class="ts-label">${d.label}</div><div class="ts-val">${counts[d.key]}</div></div>
    </div>`).join('');
}

/* ── Kanban ──────────────────────────────────────────────────── */
function renderKanban(){
  const ft = filtered();
  Object.keys(STATUS_CONFIG).forEach(status=>{
    const cfg   = STATUS_CONFIG[status];
    const items = ft.filter(t=>t.status===status);
    const col   = document.getElementById('col-'+status);
    // header
    let html = `<div class="col-header">
      <div class="col-dot" style="background:${cfg.color}"></div>
      <div class="col-title">${cfg.label}</div>
      <span class="col-count ${cfg.countClass}">${items.length}</span>
    </div>
    <div class="col-body">`;
    if(!items.length){
      html += `<div class="col-empty"><i class="ti ti-inbox"></i>없음</div>`;
    } else {
      items.forEach(t=>{ html += taskCardHTML(t); });
    }
    html += '</div>';
    col.innerHTML = html;
  });
}

function taskCardHTML(t){
  const pri  = PRI_CONFIG[t.priority];
  const cl   = clProgress(t.checklist);
  const dl   = daysLeft(t.due);
  const dlTxt= dl===null?'':dl<0?`<span style="color:#dc2626;font-weight:500;">${Math.abs(dl)}일 초과</span>`:dl===0?`<span style="color:#dc2626;font-weight:500;">오늘 마감</span>`:`D-${dl}`;
  const tags = (t.tags||[]).map(tag=>`<span class="tc-tag badge-gray">${tag}</span>`).join('');
  const clBar= cl?`<div class="tc-checklist-bar">
    <div class="cl-track"><div class="cl-fill" style="width:${cl.pct}%"></div></div>
    <span class="cl-txt">${cl.done}/${cl.total}</span>
  </div>`:'';
  return `
  <div class="task-card" onclick="openModal('${t.id}')">
    <div class="tc-top">
      <div class="tc-title">${t.title}</div>
      <button class="tc-menu" onclick="event.stopPropagation();confirmDelete('${t.id}')" aria-label="삭제"><i class="ti ti-trash"></i></button>
    </div>
    ${t.desc?`<div class="tc-desc">${t.desc}</div>`:''}
    ${tags?`<div class="tc-tags">${tags}</div>`:''}
    <div class="tc-meta">
      <div class="tc-meta-item"><div class="priority-dot ${pri.dot}"></div>${pri.label}</div>
      ${t.assignee?`<div class="tc-meta-item"><i class="ti ti-user"></i>${t.assignee}</div>`:''}
      ${t.due?`<div class="tc-meta-item"><i class="ti ti-calendar-due"></i>${dlTxt}</div>`:''}
      ${t.files&&t.files.length?`<div class="tc-meta-item"><i class="ti ti-paperclip"></i>${t.files.length}</div>`:''}
    </div>
    ${clBar}
  </div>`;
}

/* ── List ────────────────────────────────────────────────────── */
function renderList(){
  const ft  = filtered();
  const body= document.getElementById('listBody');
  if(!ft.length){
    body.innerHTML=`<div class="list-empty"><i class="ti ti-mood-empty"></i><span>Task가 없습니다.</span></div>`;
    return;
  }
  body.innerHTML = ft.map(t=>{
    const pri = PRI_CONFIG[t.priority];
    const cfg = STATUS_CONFIG[t.status];
    const dl  = daysLeft(t.due);
    const dlColor= dl!==null&&dl<=1?'color:#dc2626;':'';
    const tags= (t.tags||[]).slice(0,2).map(tag=>`<span class="tc-tag badge-gray" style="font-size:9px;">${tag}</span>`).join('');
    return `
    <div class="lt-row" onclick="openModal('${t.id}')">
      <div class="lt-title-cell">
        <div class="priority-dot ${pri.dot}"></div>
        <div>
          <div class="lt-title">${t.title}</div>
          ${tags?`<div class="lt-tags" style="margin-top:2px;">${tags}</div>`:''}
        </div>
      </div>
      <div class="lt-cell"><span class="tc-tag ${pri.badge}">${pri.label}</span></div>
      <div class="lt-cell"><span class="tc-tag ${cfg.colClass}" style="font-size:10px;padding:2px 7px;border-radius:8px;border:.5px solid;">${cfg.label}</span></div>
      <div class="lt-cell" style="${dlColor}">${formatDate(t.due)||'—'}</div>
      <div class="lt-cell">${t.assignee||'—'}</div>
      <div class="lt-actions" onclick="event.stopPropagation()">
        <button class="lt-act-btn" onclick="openModal('${t.id}')" aria-label="수정"><i class="ti ti-edit"></i></button>
        <button class="lt-act-btn del" onclick="confirmDelete('${t.id}')" aria-label="삭제"><i class="ti ti-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

/* ── Right Panel ─────────────────────────────────────────────── */
function renderRightPanel(){
  // 우선순위 요약
  const counts={high:0,mid:0,low:0};
  tasks.forEach(t=>{ if(counts[t.priority]!==undefined) counts[t.priority]++; });
  document.getElementById('priSummary').innerHTML = Object.entries(PRI_CONFIG).map(([k,v])=>`
    <div class="pri-row">
      <div class="pri-row-left"><div class="priority-dot ${v.dot}"></div>${v.label}</div>
      <span style="font-weight:500;color:var(--text-primary);">${counts[k]}</span>
    </div>`).join('');

  // 마감 임박
  const upcoming = tasks
    .filter(t=>t.due&&t.status!=='done'&&t.status!=='hold')
    .map(t=>({...t,dl:daysLeft(t.due)}))
    .filter(t=>t.dl!==null&&t.dl<=3)
    .sort((a,b)=>a.dl-b.dl).slice(0,5);
  const dueEl = document.getElementById('dueSoonList');
  dueEl.innerHTML = upcoming.length ? upcoming.map(t=>{
    const cls = t.dl<=0?'urgent':'soon';
    const txt = t.dl<0?`${Math.abs(t.dl)}일 초과`:t.dl===0?'오늘 마감':`D-${t.dl}`;
    return `<div class="rp-item ${cls}"><div class="rp-item-t">${t.title}</div><div class="rp-item-m">${txt} · ${formatDate(t.due)}</div></div>`;
  }).join('') : '<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">마감 임박 항목 없음</div>';
}

/* ── Modal Open/Close ────────────────────────────────────────── */
function openModal(id){
  editingCL=[]; editingFiles=[];
  if(id && typeof id==='string' && id!==''){
    const t = tasks.find(x=>x.id===id); if(!t) return;
    document.getElementById('modalTitle').textContent='Task 수정';
    document.getElementById('editId').value=id;
    document.getElementById('fTitle').value=t.title;
    document.getElementById('fPriority').value=t.priority;
    document.getElementById('fStatus').value=t.status;
    document.getElementById('fDue').value=t.due||'';
    document.getElementById('fAssignee').value=t.assignee||'';
    document.getElementById('fTags').value=(t.tags||[]).join(', ');
    document.getElementById('fDesc').value=t.desc||'';
    document.getElementById('fMemo').value=t.memo||'';
    editingCL   = JSON.parse(JSON.stringify(t.checklist||[]));
    editingFiles= [...(t.files||[])];
  } else {
    document.getElementById('modalTitle').textContent='Task 추가';
    document.getElementById('editId').value='';
    ['fTitle','fDue','fAssignee','fTags','fDesc','fMemo'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('fPriority').value='mid';
    document.getElementById('fStatus').value='todo';
  }
  renderCLList(); renderFileList();
  document.getElementById('modalBackdrop').classList.add('open');
}
function openModalPreset(pri,status){
  openModal('');
  document.getElementById('fPriority').value=pri;
  document.getElementById('fStatus').value=status;
}
function closeModal(e){
  if(e&&e.target!==document.getElementById('modalBackdrop')) return;
  document.getElementById('modalBackdrop').classList.remove('open');
}

/* ── Checklist in Modal ──────────────────────────────────────── */
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
      <div class="cl-check ${c.done?'done':''}" onclick="toggleCL(${i})">
        ${c.done?'<i class="ti ti-check"></i>':''}
      </div>
      <span class="cl-text ${c.done?'done':''}">${c.text}</span>
      <button class="btn-cl-del" onclick="removeCL(${i})" aria-label="삭제"><i class="ti ti-x"></i></button>
    </div>`).join('')
    : '<div style="font-size:11px;color:var(--text-sec);padding:4px 0;">항목 없음</div>';
}
document.getElementById('clInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();addCLItem();} });

/* ── File Attach ─────────────────────────────────────────────── */
function handleFiles(files){
  Array.from(files).forEach(f=>{ editingFiles.push(f.name); });
  renderFileList();
}
function removeFile(idx){ editingFiles.splice(idx,1); renderFileList(); }
function renderFileList(){
  const list=document.getElementById('fileList');
  list.innerHTML = editingFiles.length ? editingFiles.map((f,i)=>`
    <div class="file-item">
      <i class="ti ti-paperclip"></i>
      <span>${f}</span>
      <button class="btn-file-del" onclick="removeFile(${i})" aria-label="삭제"><i class="ti ti-x"></i></button>
    </div>`).join('') : '';
}

/* ── Save Task ───────────────────────────────────────────────── */
function saveTask(){
  const title=document.getElementById('fTitle').value.trim();
  if(!title){alert('제목을 입력해주세요.');return;}
  const id=document.getElementById('editId').value||`t_${Date.now()}`;
  const rawTags=document.getElementById('fTags').value;
  const tags=rawTags?rawTags.split(',').map(s=>s.trim()).filter(Boolean):[];
  const task={
    id, title,
    priority:  document.getElementById('fPriority').value,
    status:    document.getElementById('fStatus').value,
    due:       document.getElementById('fDue').value,
    assignee:  document.getElementById('fAssignee').value.trim(),
    tags,
    desc:      document.getElementById('fDesc').value.trim(),
    checklist: editingCL,
    files:     editingFiles,
    memo:      document.getElementById('fMemo').value.trim(),
    createdAt: new Date().toISOString().slice(0,10),
  };
  const idx=tasks.findIndex(t=>t.id===id);
  if(idx>=0) tasks[idx]=task; else tasks.push(task);
  document.getElementById('modalBackdrop').classList.remove('open');
  renderAll();
}

/* ── Delete ──────────────────────────────────────────────────── */
function confirmDelete(id){
  deleteTarget=id;
  document.getElementById('deleteBackdrop').classList.add('open');
}
function closeDelete(e){
  if(e&&e.target!==document.getElementById('deleteBackdrop')) return;
  document.getElementById('deleteBackdrop').classList.remove('open');
  deleteTarget=null;
}
document.getElementById('btnConfirmDelete').addEventListener('click',()=>{
  if(!deleteTarget) return;
  tasks=tasks.filter(t=>t.id!==deleteTarget);
  deleteTarget=null;
  document.getElementById('deleteBackdrop').classList.remove('open');
  renderAll();
});

/* ── Search ──────────────────────────────────────────────────── */
document.getElementById('taskSearch').addEventListener('input',()=>renderAll());

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
