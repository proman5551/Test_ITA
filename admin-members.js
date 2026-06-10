/* =====================================================
   INSPIRE — admin-members.js
===================================================== */

const MEMBER_KEY    = 'inspire_members_data';
const INTERVIEW_KEY = 'inspire_interviews';

/* ── 아바타 색상 팔레트 ─────────────────────────── */
const AVATAR_COLORS = [
  '#7c3aed','#2563eb','#0f766e','#b45309',
  '#dc2626','#16a34a','#0284c7','#9333ea',
  '#c2410c','#0d9488',
];

/* ── 면담 유형 설정 ─────────────────────────────── */
const IV_TYPES = {
  regular:     { label:'정기 면담',  cls:'iv-type-regular' },
  performance: { label:'성과 면담',  cls:'iv-type-performance' },
  promotion:   { label:'진급 면담',  cls:'iv-type-promotion' },
  disciplinary:{ label:'징계 면담',  cls:'iv-type-disciplinary' },
  welfare:     { label:'복지 상담',  cls:'iv-type-welfare' },
  etc:         { label:'기타',       cls:'iv-type-etc' },
};

/* ── 샘플 초기 데이터 ─────────────────────────────── */
const INITIAL_MEMBERS = [
  { id:'m1', name:'손대훈',  empId:'EMP-001', dept:'Control Room',    position:'Supervisor',      rank:'과장', color:'#7c3aed', hireDate:'2019-03-02', lastPromoDate:'2023-03-02', phone:'010-1234-5678', email:'dh.son@inspire.com',   memo:'' },
  { id:'m2', name:'김아무개',empId:'EMP-002', dept:'Control Room',    position:'Senior Officer',  rank:'대리', color:'#2563eb', hireDate:'2021-06-14', lastPromoDate:'2024-01-10', phone:'010-2345-6789', email:'km.kim@inspire.com',   memo:'' },
  { id:'m3', name:'이담당',  empId:'EMP-003', dept:'CCTV Monitoring', position:'Officer',         rank:'주임', color:'#0f766e', hireDate:'2022-01-10', lastPromoDate:'2022-01-10', phone:'010-3456-7890', email:'dd.lee@inspire.com',   memo:'' },
  { id:'m4', name:'박야간',  empId:'EMP-004', dept:'Field Security',  position:'Junior Officer',  rank:'사원', color:'#b45309', hireDate:'2023-08-01', lastPromoDate:null,         phone:'010-4567-8901', email:'yn.park@inspire.com',  memo:'' },
  { id:'m5', name:'최보안',  empId:'EMP-005', dept:'Field Security',  position:'Officer',         rank:'주임', color:'#dc2626', hireDate:'2020-11-23', lastPromoDate:'2022-11-23', phone:'010-5678-9012', email:'bs.choi@inspire.com',  memo:'' },
  { id:'m6', name:'정순찰',  empId:'EMP-006', dept:'Field Security',  position:'Senior Officer',  rank:'대리', color:'#16a34a', hireDate:'2018-07-05', lastPromoDate:'2023-07-05', phone:'010-6789-0123', email:'sc.jung@inspire.com',  memo:'' },
  { id:'m7', name:'한감시',  empId:'EMP-007', dept:'CCTV Monitoring', position:'Officer',         rank:'주임', color:'#0284c7', hireDate:'2021-03-15', lastPromoDate:'2021-03-15', phone:'010-7890-1234', email:'gs.han@inspire.com',   memo:'' },
  { id:'m8', name:'오출입',  empId:'EMP-008', dept:'Administration',  position:'Senior Officer',  rank:'대리', color:'#9333ea', hireDate:'2017-09-01', lastPromoDate:'2024-09-01', phone:'010-8901-2345', email:'ci.oh@inspire.com',    memo:'' },
];

const INITIAL_INTERVIEWS = {
  m1: [
    { id:'iv1', date:'2025-03-15', type:'regular',     content:'분기 정기 면담. 업무 만족도 良, KPI 달성 순조로움. 야간 교대 스케줄 조정 논의.', result:'교대 스케줄 다음 달 적용 예정.', interviewer:'손대훈' },
    { id:'iv2', date:'2025-05-20', type:'performance',  content:'상반기 성과 면담. KPI 달성률 85%, 목표 초과 달성 예상. 리더십 역량 향상 중.', result:'하반기 Senior 포지션 전환 검토.', interviewer:'손대훈' },
  ],
  m2: [
    { id:'iv3', date:'2025-02-10', type:'regular',     content:'정기 면담. 신규 CCTV 시스템 적응 良. 교육 이수 완료.', result:'없음.', interviewer:'손대훈' },
  ],
  m3: [
    { id:'iv4', date:'2025-04-05', type:'regular',     content:'정기 면담. 업무 태도 良, 주간 보고서 작성 능력 향상 필요.', result:'보고서 작성 교육 6월 예정.', interviewer:'손대훈' },
  ],
};

/* ── 헬퍼 ──────────────────────────────────────── */
function calcYears(hireDate){
  if(!hireDate) return 0;
  const diff = new Date() - new Date(hireDate);
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}
function calcMonths(hireDate){
  if(!hireDate) return 0;
  const h = new Date(hireDate), n = new Date();
  return (n.getFullYear()-h.getFullYear())*12 + (n.getMonth()-h.getMonth());
}
function yearLabel(hireDate){
  const months = calcMonths(hireDate);
  if(months < 12) return `${months}개월차`;
  const yrs = Math.floor(months/12);
  const rem = months % 12;
  return rem > 0 ? `${yrs}년 ${rem}개월차` : `${yrs}년차`;
}
function isPromoRestricted(lastPromoDate){
  if(!lastPromoDate) return false;
  const diff = (new Date() - new Date(lastPromoDate)) / (365.25*24*3600*1000);
  return diff < 2;
}
function promoRemainingMonths(lastPromoDate){
  if(!lastPromoDate) return 0;
  const diff = (new Date() - new Date(lastPromoDate)) / (1000*3600*24*30.44);
  const remaining = 24 - diff;
  return Math.max(0, Math.ceil(remaining));
}
function formatDate(d){ return d?d.replace(/-/g,'.'):'—'; }
function initials(name){ return name?name.slice(0,2):'?'; }
function pctColor(p){ return p>=80?'#16a34a':p>=50?'#2563eb':p>=30?'#d97706':'#dc2626'; }

/* ── Storage ───────────────────────────────────── */
function loadMembers(){ try{ return JSON.parse(localStorage.getItem(MEMBER_KEY)||'null')||JSON.parse(JSON.stringify(INITIAL_MEMBERS)); }catch{ return JSON.parse(JSON.stringify(INITIAL_MEMBERS)); } }
function saveMembers(d){ localStorage.setItem(MEMBER_KEY, JSON.stringify(d)); }
function loadInterviews(){ try{ return JSON.parse(localStorage.getItem(INTERVIEW_KEY)||'null')||JSON.parse(JSON.stringify(INITIAL_INTERVIEWS)); }catch{ return JSON.parse(JSON.stringify(INITIAL_INTERVIEWS)); } }
function saveInterviews(d){ localStorage.setItem(INTERVIEW_KEY, JSON.stringify(d)); }

/* ── KPI / Task / Project 데이터 ─────────────────── */
function getMemberStats(name){
  try{
    const kpis  = JSON.parse(localStorage.getItem('inspire_kpi_items')||'[]');
    const tasks = JSON.parse(localStorage.getItem('inspire_tasks')||'[]');
    const projs = JSON.parse(localStorage.getItem('inspire_projects')||'[]');
    const mKPIs = kpis.filter(k=>(k.members||[]).includes(name)&&k.target>0);
    const mTasks= tasks.filter(t=>t.assignee===name);
    const mProjs= projs.filter(p=>(p.members||[]).includes(name));
    const avgKPI= mKPIs.length?Math.round(mKPIs.reduce((s,k)=>s+Math.min(100,Math.round(k.current/k.target*100)),0)/mKPIs.length):0;
    return { kpiCount:mKPIs.length, avgKPI, taskCount:mTasks.length, doneTask:mTasks.filter(t=>t.status==='done').length, projCount:mProjs.length, kpis:mKPIs };
  }catch{ return {kpiCount:0,avgKPI:0,taskCount:0,doneTask:0,projCount:0,kpis:[]}; }
}

/* ── 상태 ───────────────────────────────────────── */
let currentView       = 'kanban';
let selectedMemberId  = null;
let deleteTargetId    = null;
let editColorSelected = AVATAR_COLORS[0];

/* ── 필터된 멤버 목록 ────────────────────────────── */
function filteredMembers(){
  const members = loadMembers();
  const q    = (document.getElementById('memberSearch')?.value||'').toLowerCase();
  const dept = document.getElementById('deptFilter')?.value||'all';
  const sort = document.getElementById('sortFilter')?.value||'hire';
  const prom = document.getElementById('promFilter')?.value||'all';

  let result = members.filter(m=>{
    if(dept!=='all' && m.dept!==dept) return false;
    if(prom==='restricted' && !isPromoRestricted(m.lastPromoDate)) return false;
    if(prom==='eligible'   &&  isPromoRestricted(m.lastPromoDate)) return false;
    if(q && !m.name.toLowerCase().includes(q) &&
       !m.empId.toLowerCase().includes(q) &&
       !m.position.toLowerCase().includes(q)) return false;
    return true;
  });

  result.sort((a,b)=>{
    if(sort==='hire')     return (a.hireDate||'').localeCompare(b.hireDate||'');
    if(sort==='position'){
      const ORDER = ['Supervisor','Senior Officer','Officer','Junior Officer'];
      return ORDER.indexOf(a.position) - ORDER.indexOf(b.position);
    }
    return a.name.localeCompare(b.name, 'ko');
  });
  return result;
}

/* ── 뷰 전환 ────────────────────────────────────── */
function switchView(v){
  currentView = v;
  document.getElementById('memberKanban').style.display   = v==='kanban'?'grid':'none';
  document.getElementById('memberListWrap').style.display = v==='list'?'block':'none';
  document.getElementById('tabKanban').classList.toggle('active', v==='kanban');
  document.getElementById('tabList').classList.toggle('active',   v==='list');
  renderMemberList();
}

/* ── 전체 렌더 ──────────────────────────────────── */
function renderAll(){
  populateDeptFilter();
  renderMemberList();
}

/* ── 부서 필터 초기화 ────────────────────────────── */
function populateDeptFilter(){
  const sel  = document.getElementById('deptFilter');
  if(sel.options.length > 1) return;
  const depts = [...new Set(loadMembers().map(m=>m.dept))].sort();
  depts.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; sel.appendChild(o); });
}

/* ── 멤버 목록 렌더 ──────────────────────────────── */
function renderMemberList(){
  const members = filteredMembers();
  if(currentView==='kanban') renderKanban(members);
  else                        renderList(members);
}

/* 칸반 카드 뷰 */
function renderKanban(members){
  const grid = document.getElementById('memberKanban');
  if(!members.length){
    grid.innerHTML='<div class="list-empty" style="grid-column:1/-1;"><i class="ti ti-user-off"></i><span>조건에 맞는 사원이 없습니다.</span></div>'; return;
  }
  grid.innerHTML = members.map(m=>{
    const restricted = isPromoRestricted(m.lastPromoDate);
    const selected   = m.id===selectedMemberId;
    return `
      <div class="mc-card${selected?' selected-card':''}" onclick="selectMember('${m.id}')">
        ${m.lastPromoDate?`<div class="promo-dot ${restricted?'restricted':'eligible'}" title="${restricted?'진급 제한 중':'진급 가능'}"></div>`:''}
        <div class="mc-card-avatar" style="background:${m.color};">${initials(m.name)}</div>
        <div class="mc-card-name">${m.name}</div>
        <div class="mc-card-empid">${m.empId}</div>
        <div class="mc-card-position">${m.position}</div>
        <div class="mc-card-rank">${m.rank||'—'}</div>
        <div class="mc-card-badges">
          ${restricted?`<span style="font-size:9px;padding:1px 5px;border-radius:5px;background:var(--danger-bg);color:var(--danger-t);border:.5px solid var(--danger-b);">진급제한</span>`:''}
        </div>
      </div>`;
  }).join('');
}

/* 리스트 뷰 */
function renderList(members){
  const body = document.getElementById('memberListBody');
  if(!members.length){
    body.innerHTML='<div class="list-empty"><i class="ti ti-user-off"></i><span>조건에 맞는 사원이 없습니다.</span></div>'; return;
  }
  body.innerHTML = members.map(m=>{
    const yrs        = yearLabel(m.hireDate);
    const restricted = isPromoRestricted(m.lastPromoDate);
    const selected   = m.id===selectedMemberId;
    const promoCls   = !m.lastPromoDate?'none':restricted?'restricted':'eligible';
    const promoTxt   = !m.lastPromoDate?'이력 없음':restricted?`제한 (${promoRemainingMonths(m.lastPromoDate)}개월 남음)`:'진급 가능';
    return `
      <div class="ml-row${selected?' selected-row':''}" onclick="selectMember('${m.id}')">
        <div class="ml-cell ml-photo"><div class="ml-avatar" style="background:${m.color};">${initials(m.name)}</div></div>
        <div class="ml-cell ml-name">
          <div class="ml-name-wrap">
            <div class="ml-name">${m.name}</div>
            <div class="ml-empid">${m.empId}</div>
          </div>
        </div>
        <div class="ml-cell ml-dept" style="font-size:11px;color:var(--text-sec);">${m.dept}</div>
        <div class="ml-cell ml-position" style="font-size:11px;">${m.position}</div>
        <div class="ml-cell ml-rank" style="font-size:11px;">${m.rank||'—'}</div>
        <div class="ml-cell ml-hire">
          <div style="font-size:11px;">${formatDate(m.hireDate)}</div>
          <div style="font-size:10px;color:var(--sb-muted);">${yrs}</div>
        </div>
        <div class="ml-cell ml-promo">
          <span class="promo-badge ${promoCls}">
            <i class="ti ${restricted?'ti-lock':'ti-circle-check'}" style="font-size:10px;"></i>
            ${promoTxt}
          </span>
        </div>
        <div class="ml-cell ml-actions" onclick="event.stopPropagation()">
          <div class="ml-action-btns">
            <button class="ml-act-btn edit" onclick="openEditModal('${m.id}')" title="수정"><i class="ti ti-edit"></i></button>
            <button class="ml-act-btn del"  onclick="openDeleteModal('${m.id}')" title="삭제"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── 상단 상세 패널 ──────────────────────────────── */
function selectMember(id){
  selectedMemberId = id;
  renderMemberList(); // 선택 하이라이트 갱신
  renderDetailPanel(id);
}

function renderDetailPanel(id){
  const members = loadMembers();
  const m = members.find(x=>x.id===id);
  if(!m){ document.getElementById('detailEmpty').style.display='flex'; document.getElementById('detailContent').style.display='none'; return; }

  document.getElementById('detailEmpty').style.display='none';
  document.getElementById('detailContent').style.display='grid';

  const yrs        = yearLabel(m.hireDate);
  const restricted = isPromoRestricted(m.lastPromoDate);
  const remMonths  = promoRemainingMonths(m.lastPromoDate);
  const stats      = getMemberStats(m.name);

  /* 프로필 */
  document.getElementById('detailProfile').innerHTML = `
    <div class="dp-top">
      <div class="dp-avatar" style="background:${m.color};">${initials(m.name)}</div>
      <div class="dp-name-wrap">
        <div class="dp-name">${m.name}</div>
        <div class="dp-empid">${m.empId}</div>
        <div class="dp-position">${m.position}${m.rank?` · ${m.rank}`:''}</div>
      </div>
    </div>
    <div class="dp-badges">
      <span class="year-badge"><i class="ti ti-calendar"></i>${yrs}</span>
      ${m.lastPromoDate
        ? restricted
          ? `<span class="promo-restricted"><i class="ti ti-lock"></i>진급제한 (${remMonths}개월 남음)</span>`
          : `<span class="promo-eligible"><i class="ti ti-circle-check"></i>진급 가능</span>`
        : `<span class="promo-none">진급이력 없음</span>`}
    </div>
    <div class="dp-fields">
      <div class="dp-field"><div class="dp-field-label">부서</div><div class="dp-field-val">${m.dept}</div></div>
      <div class="dp-field"><div class="dp-field-label">입사일</div><div class="dp-field-val">${formatDate(m.hireDate)}</div></div>
      ${m.lastPromoDate?`<div class="dp-field"><div class="dp-field-label">최근진급</div><div class="dp-field-val">${formatDate(m.lastPromoDate)}</div></div>`:''}
      ${m.phone?`<div class="dp-field"><div class="dp-field-label">연락처</div><div class="dp-field-val">${m.phone}</div></div>`:''}
      ${m.email?`<div class="dp-field"><div class="dp-field-label">이메일</div><div class="dp-field-val">${m.email}</div></div>`:''}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      <button class="btn-add-iv" style="font-size:10px;" onclick="openEditModal('${m.id}')"><i class="ti ti-edit"></i>정보 수정</button>
      <button class="btn-add-iv" style="background:var(--danger-bg);color:var(--danger-t);border-color:var(--danger-b);font-size:10px;" onclick="openDeleteModal('${m.id}')"><i class="ti ti-trash"></i>삭제</button>
    </div>`;

  /* 업무 현황 */
  const kpiRows = stats.kpis.slice(0,3).map(k=>{
    const pct=Math.min(100,Math.round(k.current/k.target*100));
    const col=pctColor(pct);
    return `<div class="ds-kpi-row">
      <div style="font-size:10px;color:var(--text-sec);width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${k.title}">${k.title}</div>
      <div class="ds-kpi-track"><div class="ds-kpi-fill" style="width:${pct}%;background:${col};"></div></div>
      <div class="ds-kpi-pct" style="color:${col};">${pct}%</div>
    </div>`;
  }).join('');

  document.getElementById('detailStats').innerHTML = `
    <div class="ds-title">업무 현황</div>
    <div class="ds-grid">
      <div class="ds-card"><div class="ds-card-val" style="color:${pctColor(stats.avgKPI)};">${stats.avgKPI}%</div><div class="ds-card-label">KPI 달성률</div></div>
      <div class="ds-card"><div class="ds-card-val">${stats.doneTask}/${stats.taskCount}</div><div class="ds-card-label">Task 완료</div></div>
      <div class="ds-card"><div class="ds-card-val">${stats.projCount}</div><div class="ds-card-label">참여 프로젝트</div></div>
    </div>
    ${stats.kpis.length?`<div class="ds-kpi-wrap"><div class="ds-kpi-label">KPI 항목별 달성률</div>${kpiRows}</div>`:'<div style="font-size:11px;color:var(--text-sec);">KPI 데이터 없음</div>'}`;

  /* 면담 기록 */
  renderInterviewPanel(m.id);
}

function renderInterviewPanel(memberId){
  const interviews = loadInterviews();
  const ivs = (interviews[memberId]||[]).slice().reverse();
  const panel = document.getElementById('detailInterview');

  const listHTML = ivs.length
    ? ivs.map((iv,ri)=>{
        const idx = (interviews[memberId]||[]).length-1-ri;
        const typeCfg = IV_TYPES[iv.type]||IV_TYPES.etc;
        return `
          <div class="iv-item ${iv.type}">
            <div class="iv-item-top">
              <span class="iv-date">${formatDate(iv.date)}</span>
              <span class="iv-type-badge ${typeCfg.cls}">${typeCfg.label}</span>
              <span class="iv-interviewer">${iv.interviewer||''}</span>
              <button class="iv-del-btn" onclick="deleteInterview('${memberId}',${idx})" title="삭제"><i class="ti ti-x"></i></button>
            </div>
            <div class="iv-content">${iv.content}</div>
            ${iv.result?`<div class="iv-result">📋 ${iv.result}</div>`:''}
          </div>`;
      }).join('')
    : '<div class="iv-empty"><i class="ti ti-clipboard-off"></i>면담 기록이 없습니다.</div>';

  panel.innerHTML = `
    <div class="di-header">
      <div class="di-title"><i class="ti ti-message-dots"></i>면담 기록</div>
      <button class="btn-add-iv" onclick="openInterviewModal('${memberId}')">
        <i class="ti ti-plus"></i>면담 추가
      </button>
    </div>
    <div class="iv-list">${listHTML}</div>`;
}

/* ── 면담 삭제 ──────────────────────────────────── */
function deleteInterview(memberId, idx){
  const ivs = loadInterviews();
  if(ivs[memberId]) ivs[memberId].splice(idx, 1);
  saveInterviews(ivs);
  renderInterviewPanel(memberId);
}

/* ── 사원 추가/수정 모달 ──────────────────────────── */
function buildColorPicker(selected){
  document.getElementById('colorPickerRow').innerHTML = AVATAR_COLORS.map(c=>`
    <div class="color-swatch ${c===selected?'selected':''}" style="background:${c};" onclick="selectColor('${c}')"></div>
  `).join('');
  editColorSelected = selected;
  document.getElementById('avatarPreview').style.background = selected;
}

function selectColor(c){
  editColorSelected = c;
  document.querySelectorAll('.color-swatch').forEach(s=>s.classList.toggle('selected', s.style.background===c||s.style.backgroundColor===c));
  document.getElementById('avatarPreview').style.background = c;
  const name = document.getElementById('fmName').value.trim();
  document.getElementById('avatarPreview').textContent = name?initials(name):'?';
}

document.addEventListener('input', e=>{
  if(e.target.id==='fmName'){
    const n = e.target.value.trim();
    document.getElementById('avatarPreview').textContent = n?initials(n):'?';
  }
});

function openAddModal(){
  document.getElementById('memberModalTitle').textContent = '사원 추가';
  document.getElementById('editMemberId').value = '';
  ['fmName','fmEmpId','fmRank','fmPhone','fmEmail','fmMemo'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fmDept').value = 'Control Room';
  document.getElementById('fmPosition').value = 'Officer';
  document.getElementById('fmHireDate').value = '';
  document.getElementById('fmPromDate').value = '';
  buildColorPicker(AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)]);
  document.getElementById('memberModalBackdrop').classList.add('open');
}

function openEditModal(id){
  const m = loadMembers().find(x=>x.id===id);
  if(!m) return;
  document.getElementById('memberModalTitle').textContent = '사원 수정';
  document.getElementById('editMemberId').value = id;
  document.getElementById('fmName').value     = m.name;
  document.getElementById('fmEmpId').value    = m.empId;
  document.getElementById('fmDept').value     = m.dept;
  document.getElementById('fmPosition').value = m.position;
  document.getElementById('fmRank').value     = m.rank||'';
  document.getElementById('fmHireDate').value = m.hireDate||'';
  document.getElementById('fmPromDate').value = m.lastPromoDate||'';
  document.getElementById('fmPhone').value    = m.phone||'';
  document.getElementById('fmEmail').value    = m.email||'';
  document.getElementById('fmMemo').value     = m.memo||'';
  buildColorPicker(m.color||AVATAR_COLORS[0]);
  document.getElementById('avatarPreview').textContent = initials(m.name);
  document.getElementById('memberModalBackdrop').classList.add('open');
}

function closeMemberModal(e){
  if(e&&e.target!==document.getElementById('memberModalBackdrop')) return;
  document.getElementById('memberModalBackdrop').classList.remove('open');
}

function saveMember(){
  const name = document.getElementById('fmName').value.trim();
  const empId= document.getElementById('fmEmpId').value.trim();
  if(!name||!empId){ alert('이름과 사번은 필수입니다.'); return; }
  const id  = document.getElementById('editMemberId').value || `m_${Date.now()}`;
  const members = loadMembers();
  const member = {
    id, name, empId,
    dept:         document.getElementById('fmDept').value,
    position:     document.getElementById('fmPosition').value,
    rank:         document.getElementById('fmRank').value.trim(),
    color:        editColorSelected,
    hireDate:     document.getElementById('fmHireDate').value,
    lastPromoDate:document.getElementById('fmPromDate').value||null,
    phone:        document.getElementById('fmPhone').value.trim(),
    email:        document.getElementById('fmEmail').value.trim(),
    memo:         document.getElementById('fmMemo').value.trim(),
  };
  const idx = members.findIndex(m=>m.id===id);
  if(idx>=0) members[idx]=member; else members.push(member);
  saveMembers(members);
  document.getElementById('memberModalBackdrop').classList.remove('open');
  if(selectedMemberId===id) renderDetailPanel(id);
  renderAll();
}

/* ── 삭제 모달 ──────────────────────────────────── */
function openDeleteModal(id){
  deleteTargetId = id;
  document.getElementById('deleteModalBackdrop').classList.add('open');
}
function closeDeleteModal(e){
  if(e&&e.target!==document.getElementById('deleteModalBackdrop')) return;
  document.getElementById('deleteModalBackdrop').classList.remove('open');
  deleteTargetId=null;
}
function confirmDeleteMember(){
  if(!deleteTargetId) return;
  const members = loadMembers().filter(m=>m.id!==deleteTargetId);
  saveMembers(members);
  const ivs = loadInterviews(); delete ivs[deleteTargetId]; saveInterviews(ivs);
  if(selectedMemberId===deleteTargetId){
    selectedMemberId=null;
    document.getElementById('detailEmpty').style.display='flex';
    document.getElementById('detailContent').style.display='none';
  }
  deleteTargetId=null;
  document.getElementById('deleteModalBackdrop').classList.remove('open');
  renderAll();
}

/* ── 면담 기록 모달 ──────────────────────────────── */
function openInterviewModal(memberId){
  document.getElementById('interviewMemberId').value = memberId;
  document.getElementById('ivDate').value        = new Date().toISOString().slice(0,10);
  document.getElementById('ivType').value        = 'regular';
  document.getElementById('ivContent').value     = '';
  document.getElementById('ivResult').value      = '';
  document.getElementById('ivInterviewer').value = '손대훈';
  document.getElementById('interviewModalBackdrop').classList.add('open');
}
function closeInterviewModal(e){
  if(e&&e.target!==document.getElementById('interviewModalBackdrop')) return;
  document.getElementById('interviewModalBackdrop').classList.remove('open');
}
function saveInterview(){
  const content = document.getElementById('ivContent').value.trim();
  if(!content){ alert('면담 내용을 입력해주세요.'); return; }
  const memberId = document.getElementById('interviewMemberId').value;
  const ivs = loadInterviews();
  if(!ivs[memberId]) ivs[memberId]=[];
  ivs[memberId].push({
    id:          `iv_${Date.now()}`,
    date:        document.getElementById('ivDate').value,
    type:        document.getElementById('ivType').value,
    content,
    result:      document.getElementById('ivResult').value.trim(),
    interviewer: document.getElementById('ivInterviewer').value.trim(),
  });
  saveInterviews(ivs);
  document.getElementById('interviewModalBackdrop').classList.remove('open');
  renderInterviewPanel(memberId);
}

/* ── 검색 / 필터 ────────────────────────────────── */
document.getElementById('memberSearch').addEventListener('input', ()=>renderMemberList());

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar(); renderAll();
});
