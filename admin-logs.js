/* =====================================================
   INSPIRE — admin-logs.js
===================================================== */

/* ── 로그 유형 설정 ─────────────────────────────── */
const LOG_TYPES = {
  daily:    { label:'데일리 로그',  icon:'ti-clipboard-list', color:'#2563eb', bg:'var(--info-bg)',   cls:'type-daily' },
  incident: { label:'사건보고서',   icon:'ti-file-alert',     color:'#dc2626', bg:'var(--danger-bg)', cls:'type-incident' },
  handover: { label:'인수인계',     icon:'ti-transfer',       color:'#d97706', bg:'var(--warn-bg)',   cls:'type-handover' },
  cctv:     { label:'CCTV Review', icon:'ti-camera',         color:'#16a34a', bg:'var(--ok-bg)',     cls:'type-cctv' },
  warrant:  { label:'경찰영장공문', icon:'ti-gavel',          color:'#7c3aed', bg:'var(--purple-bg)', cls:'type-warrant' },
  system:   { label:'시스템 활동',  icon:'ti-activity',       color:'#94a3b8', bg:'var(--gray-bg)',   cls:'type-system' },
};

const TEAM_MEMBERS = [
  { name:'손대훈',  color:'#7c3aed' },
  { name:'김아무개',color:'#2563eb' },
  { name:'이담당',  color:'#0f766e' },
  { name:'박야간',  color:'#b45309' },
];

/* ── 샘플 로그 데이터 생성 ──────────────────────── */
function generateLogs(){
  const logs = [];
  const today = new Date();
  let id = 1;
  const entries = [
    /* 6월 6일 */
    { date:'2025-06-06', time:'09:05', type:'system',   member:'손대훈',  title:'로그인',           content:'관리자 계정으로 시스템 접속', status:'정상', detail:{ip:'192.168.1.10', device:'Chrome/Win11'} },
    { date:'2025-06-06', time:'09:15', type:'handover', member:'손대훈',  title:'주간 인수인계 접수', content:'박야간 → 손대훈 인수인계 완료. 야간 특이사항 없음.', status:'완료', detail:{from:'박야간', to:'손대훈', special:'없음'} },
    { date:'2025-06-06', time:'09:30', type:'cctv',     member:'손대훈',  title:'CCTV A구역 점검',   content:'A구역 카메라 1~5번 정상 작동 확인. 6번 화질 저하 발견.', status:'이상발견', detail:{zone:'A구역', issue:'6번 카메라 화질 저하'} },
    { date:'2025-06-06', time:'10:00', type:'daily',    member:'김아무개', title:'오전 데일리 로그',   content:'오전 순찰 정상 완료. 로비 이상 없음. 주차장 A구역 확인.', status:'완료', detail:{patrol:'정상', note:''} },
    { date:'2025-06-06', time:'11:30', type:'cctv',     member:'이담당',  title:'CCTV B구역 점검',   content:'B구역 전체 카메라 정상. 녹화 스토리지 잔여 용량 73%.', status:'정상', detail:{zone:'B구역', storage:'73%'} },
    { date:'2025-06-06', time:'14:30', type:'incident', member:'손대훈',  title:'B동 무단침입 신고',  content:'B동 14:30 무단침입 시도 접수. CCTV 확인 후 경비 출동. 용의자 도주.', status:'처리중', detail:{no:'#2025-0606-01', location:'B동', cctv:'4-2번'} },
    { date:'2025-06-06', time:'15:20', type:'system',   member:'김아무개', title:'문서 수정',         content:'인수인계 양식 #INV-0605 내용 수정 저장', status:'정상', detail:{doc:'INV-0605'} },
    { date:'2025-06-06', time:'17:00', type:'handover', member:'손대훈',  title:'주간→야간 인수인계', content:'손대훈 → 이담당 인수인계. B동 무단침입 건 추가 모니터링 필요.', status:'완료', detail:{from:'손대훈', to:'이담당', special:'B동 무단침입 건 모니터링'} },
    { date:'2025-06-06', time:'19:45', type:'warrant',  member:'이담당',  title:'경찰영장공문 접수',  content:'서울중앙지방법원 영장 공문 접수 및 담당 경찰서 연락 완료.', status:'접수', detail:{court:'서울중앙지방법원', ref:'2025-영-4521'} },
    { date:'2025-06-06', time:'20:00', type:'daily',    member:'이담당',  title:'야간 데일리 로그',   content:'야간 인수 완료. B동 모니터링 중. 전체 CCTV 이상 없음.', status:'완료', detail:{patrol:'정상', note:'B동 집중 모니터링'} },
    /* 6월 5일 */
    { date:'2025-06-05', time:'09:00', type:'system',   member:'박야간',  title:'로그인',           content:'야간 근무자 시스템 접속', status:'정상', detail:{ip:'192.168.1.12'} },
    { date:'2025-06-05', time:'09:10', type:'handover', member:'박야간',  title:'야간→주간 인수인계', content:'박야간 → 손대훈 정상 인수. 야간 특이사항 없음.', status:'완료', detail:{from:'박야간', to:'손대훈', special:'없음'} },
    { date:'2025-06-05', time:'10:30', type:'daily',    member:'손대훈',  title:'오전 데일리 로그',   content:'오전 순찰 정상. 로비 분실물 보관함 정리 완료.', status:'완료', detail:{} },
    { date:'2025-06-05', time:'14:00', type:'cctv',     member:'김아무개', title:'CCTV 정기 점검',   content:'월례 정기 점검. 전 구역 이상 없음. 스토리지 교체 일정 확인.', status:'정상', detail:{scope:'전 구역', storage:'스토리지 교체 7월 예정'} },
    { date:'2025-06-05', time:'16:00', type:'incident', member:'손대훈',  title:'로비 분실물 신고',   content:'방문객 지갑 분실 신고. CCTV 확인 후 보관함 이관 완료.', status:'완료', detail:{no:'#2025-0605-01', item:'지갑', result:'보관함 이관'} },
    { date:'2025-06-05', time:'18:00', type:'handover', member:'손대훈',  title:'주간→야간 인수인계', content:'손대훈 → 박야간 인수인계. 분실물 보관함 인수.', status:'완료', detail:{from:'손대훈', to:'박야간', special:'분실물 보관함 확인 요망'} },
    { date:'2025-06-05', time:'22:10', type:'daily',    member:'박야간',  title:'야간 데일리 로그',   content:'야간 순찰 2회 완료. 전 구역 이상 없음.', status:'완료', detail:{patrol:'2회 완료', note:''} },
    /* 6월 4일 */
    { date:'2025-06-04', time:'08:55', type:'system',   member:'손대훈',  title:'로그인',           content:'시스템 접속', status:'정상', detail:{ip:'192.168.1.10'} },
    { date:'2025-06-04', time:'11:45', type:'incident', member:'이담당',  title:'외부인 무단 출입',   content:'C게이트 무단 출입 시도. 경비 제지 후 신원 확인. 방문 불허 처리.', status:'완료', detail:{no:'#2025-0604-01', gate:'C게이트', action:'방문 불허'} },
    { date:'2025-06-04', time:'14:00', type:'cctv',     member:'손대훈',  title:'CCTV C구역 점검',   content:'C구역 카메라 점검. 7번 카메라 앵글 조정 필요.', status:'조치필요', detail:{zone:'C구역', issue:'7번 앵글 조정'} },
    { date:'2025-06-04', time:'17:30', type:'handover', member:'이담당',  title:'주간→야간 인수인계', content:'이담당 → 박야간. 외부인 무단출입 건 공유.', status:'완료', detail:{from:'이담당', to:'박야간', special:'외부인 무단출입 재발 주의'} },
    /* 6월 3일 */
    { date:'2025-06-03', time:'09:00', type:'daily',    member:'손대훈',  title:'오전 데일리 로그',   content:'정상 근무 시작. 전 구역 이상 없음.', status:'완료', detail:{} },
    { date:'2025-06-03', time:'10:00', type:'cctv',     member:'김아무개', title:'CCTV D구역 점검',   content:'D구역 정상. 스토리지 용량 82% — 정리 권장.', status:'주의', detail:{zone:'D구역', storage:'82%'} },
    { date:'2025-06-03', time:'15:00', type:'warrant',  member:'손대훈',  title:'경찰영장공문 발송',  content:'전월 사건 관련 경찰 요청 공문 발송 완료.', status:'완료', detail:{target:'강남경찰서', ref:'2025-영-4433'} },
    { date:'2025-06-03', time:'17:00', type:'handover', member:'손대훈',  title:'인수인계 완료',     content:'손대훈 → 이담당. 특이사항 없음.', status:'완료', detail:{from:'손대훈', to:'이담당', special:'없음'} },
    /* 6월 2일 */
    { date:'2025-06-02', time:'02:10', type:'incident', member:'박야간',  title:'야간 순찰 이상 발견', content:'야간 순찰 중 A동 비상구 잠금장치 불량 발견. 즉시 조치 완료.', status:'완료', detail:{no:'#2025-0602-01', location:'A동 비상구', action:'잠금장치 교체'} },
    { date:'2025-06-02', time:'09:00', type:'system',   member:'손대훈',  title:'로그인',           content:'시스템 접속', status:'정상', detail:{ip:'192.168.1.10'} },
    { date:'2025-06-02', time:'10:30', type:'daily',    member:'손대훈',  title:'오전 데일리 로그',   content:'오전 점검 완료. A동 비상구 잠금장치 교체 확인.', status:'완료', detail:{} },
  ];
  entries.forEach((e,i)=>{ logs.push({ id:`log_${String(i+1).padStart(3,'0')}`, ...e }); });
  return logs;
}

const ALL_LOGS = generateLogs();

/* ── 헬퍼 ──────────────────────────────────────── */
function memberColor(name){ const m=TEAM_MEMBERS.find(x=>x.name===name); return m?m.color:'#94a3b8'; }
function initials(name){ return name?name.slice(0,2):'?'; }
function formatDate(d){ return d?d.replace(/-/g,'.'):'—'; }
function typeCfg(type){ return LOG_TYPES[type]||LOG_TYPES.system; }
function statusStyle(status){
  const map={
    '정상':   'background:var(--ok-bg);color:var(--ok-t);border-color:var(--ok-b)',
    '완료':   'background:var(--ok-bg);color:var(--ok-t);border-color:var(--ok-b)',
    '처리중': 'background:var(--info-bg);color:var(--info-t);border-color:var(--info-b)',
    '접수':   'background:var(--warn-bg);color:var(--warn-t);border-color:var(--warn-b)',
    '이상발견':'background:var(--danger-bg);color:var(--danger-t);border-color:var(--danger-b)',
    '조치필요':'background:var(--danger-bg);color:var(--danger-t);border-color:var(--danger-b)',
    '주의':   'background:var(--warn-bg);color:var(--warn-t);border-color:var(--warn-b)',
  };
  return map[status]||map['정상'];
}

/* ── 상태 ───────────────────────────────────────── */
let calYear  = 2025;
let calMonth = 5; // 0-indexed (6월 = 5)
let selectedDate    = '2025-06-06';
let selectedMembers = new Set(); // 빈 Set = 전체
let currentLogId    = null;

/* ── Render All ─────────────────────────────────── */
function renderAll(){
  renderSummary();
  renderCalendar();
  renderMemberChips();
  renderTimeline();
  renderLogTable();
  populateTblMemberFilter();
}

/* ── 요약 카드 ──────────────────────────────────── */
function renderSummary(){
  const counts={};
  Object.keys(LOG_TYPES).forEach(k=>counts[k]=0);
  ALL_LOGS.forEach(l=>{ if(counts[l.type]!==undefined) counts[l.type]++; });
  const defs=[
    { ic:'ti-clipboard-list', cls:'blue',   label:'데일리 로그',  val:counts.daily+'건',    sub:''},
    { ic:'ti-file-alert',     cls:'red',    label:'사건보고서',   val:counts.incident+'건', sub:''},
    { ic:'ti-transfer',       cls:'amber',  label:'인수인계',     val:counts.handover+'건', sub:''},
    { ic:'ti-camera',         cls:'green',  label:'CCTV Review', val:counts.cctv+'건',     sub:''},
    { ic:'ti-gavel',          cls:'purple', label:'경찰영장공문', val:counts.warrant+'건',  sub:''},
    { ic:'ti-activity',       cls:'gray',   label:'시스템 활동',  val:counts.system+'건',   sub:''},
  ];
  document.getElementById('alSummary').innerHTML = defs.map(d=>`
    <div class="als-card">
      <div class="als-ic ${d.cls}"><i class="ti ${d.ic}"></i></div>
      <div><div class="als-label">${d.label}</div><div class="als-val">${d.val}</div>${d.sub?`<div class="als-sub">${d.sub}</div>`:''}</div>
    </div>`).join('');
}

/* ── 캘린더 ─────────────────────────────────────── */
function renderCalendar(){
  const monthNames=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  document.getElementById('alCalMonth').textContent=`${calYear}년 ${monthNames[calMonth]}`;
  const grid=document.getElementById('alCalGrid');
  const today=new Date();
  // 날짜별 로그 요약
  const logsByDate={};
  ALL_LOGS.forEach(l=>{
    if(!logsByDate[l.date]) logsByDate[l.date]=[];
    logsByDate[l.date].push(l.type);
  });
  // 달력 계산
  const first=new Date(calYear,calMonth,1);
  const last =new Date(calYear,calMonth+1,0);
  const startDow=first.getDay();
  let html='';
  ['일','월','화','수','목','금','토'].forEach(d=>{ html+=`<div class="cal-day-label">${d}</div>`; });
  // 이전달 빈칸
  for(let i=0;i<startDow;i++){
    const d=new Date(calYear,calMonth,-(startDow-1-i));
    html+=`<div class="cal-day other-month">${d.getDate()}</div>`;
  }
  // 이번달
  for(let d=1;d<=last.getDate();d++){
    const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=today.getFullYear()===calYear&&today.getMonth()===calMonth&&today.getDate()===d;
    const isSel  =dateStr===selectedDate;
    const types  =[...new Set(logsByDate[dateStr]||[])];
    const dots   =types.map(t=>`<div class="cal-dot" style="background:${typeCfg(t).color};"></div>`).join('');
    const cls    =[isToday?'today':'',isSel?'selected':''].filter(Boolean).join(' ');
    html+=`<div class="cal-day ${cls}" onclick="selectDate('${dateStr}')">${d}${dots?`<div class="cal-dots">${dots}</div>`:''}</div>`;
  }
  grid.innerHTML=html;
}
function changeMonth(dir){ calMonth+=dir; if(calMonth<0){calMonth=11;calYear--;} if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); }
function selectDate(dateStr){ selectedDate=dateStr; renderCalendar(); renderTimeline(); document.getElementById('alSelectedDate').textContent=formatDate(dateStr); }

/* ── 사원 필터 칩 ────────────────────────────────── */
function renderMemberChips(){
  const logsByMember={};
  ALL_LOGS.forEach(l=>{ logsByMember[l.member]=(logsByMember[l.member]||0)+1; });
  document.getElementById('alMemberChips').innerHTML=`
    <button class="al-member-chip ${selectedMembers.size===0?'active':''}" onclick="toggleMember('all')">
      <div class="mc-chip-av" style="background:#94a3b8;">전</div>
      <div class="mc-chip-name">전체 사원</div>
      <div class="mc-chip-count">${ALL_LOGS.length}건</div>
    </button>
    ${TEAM_MEMBERS.map(m=>`
      <button class="al-member-chip ${selectedMembers.has(m.name)?'active':''}" onclick="toggleMember('${m.name}')">
        <div class="mc-chip-av" style="background:${m.color};">${initials(m.name)}</div>
        <div class="mc-chip-name">${m.name}</div>
        <div class="mc-chip-count">${logsByMember[m.name]||0}건</div>
      </button>`).join('')}`;
}
function toggleMember(name){
  if(name==='all'){ selectedMembers.clear(); }
  else {
    if(selectedMembers.has(name)) selectedMembers.delete(name);
    else selectedMembers.add(name);
  }
  renderMemberChips(); renderTimeline(); renderLogTable();
}

/* ── 타임라인 피드 ──────────────────────────────── */
function renderTimeline(){
  const typeFilter=document.getElementById('tlTypeFilter')?.value||'all';
  document.getElementById('alSelectedDate').textContent=formatDate(selectedDate);
  let logs=ALL_LOGS.filter(l=>l.date===selectedDate);
  if(selectedMembers.size>0) logs=logs.filter(l=>selectedMembers.has(l.member));
  if(typeFilter!=='all') logs=logs.filter(l=>l.type===typeFilter);
  logs.sort((a,b)=>a.time.localeCompare(b.time));
  document.getElementById('tlCount').textContent=logs.length;
  const body=document.getElementById('alTimelineBody');
  if(!logs.length){
    body.innerHTML=`<div class="tl-empty"><i class="ti ti-calendar-off"></i>${formatDate(selectedDate)}에 로그가 없습니다.</div>`;
    return;
  }
  body.innerHTML=logs.map((log,i)=>{
    const tc=typeCfg(log.type);
    return `
      <div class="tl-feed-item">
        <div class="tl-time-col">
          <div class="tl-time-text">${log.time}</div>
          <div class="tl-dot" style="background:${tc.color};box-shadow-color:${tc.color};box-shadow:0 0 0 2px ${tc.color}40;"></div>
          <div class="tl-line" style="background:${tc.color}30;"></div>
        </div>
        <div class="tl-card" onclick="openDrawer('${log.id}')">
          <div class="tl-card-top">
            <div class="tl-card-left">
              <div class="tl-type-icon" style="background:${tc.color}18;"><i class="ti ${tc.icon}" style="color:${tc.color};"></i></div>
              <div>
                <div class="tl-card-title">${log.title}</div>
                <div class="tl-card-author">${log.member} · ${tc.label}</div>
              </div>
            </div>
            <div class="tl-card-badges">
              <span class="log-type-badge ${tc.cls}">${tc.label}</span>
              <span class="status-pill" style="${statusStyle(log.status)}">${log.status}</span>
            </div>
          </div>
          <div class="tl-card-body">${log.content}</div>
        </div>
      </div>`;
  }).join('');
}

/* ── 전체 로그 테이블 ────────────────────────────── */
function filteredLogs(){
  const q    =(document.getElementById('logSearch')?.value||'').toLowerCase();
  const type =document.getElementById('tblTypeFilter')?.value||'all';
  const member=document.getElementById('tblMemberFilter')?.value||'all';
  const sort =document.getElementById('tblSortFilter')?.value||'newest';
  let logs=ALL_LOGS.filter(l=>{
    if(selectedMembers.size>0 && !selectedMembers.has(l.member)) return false;
    if(type!=='all' && l.type!==type)     return false;
    if(member!=='all' && l.member!==member) return false;
    if(q && !l.title.toLowerCase().includes(q) && !l.content.toLowerCase().includes(q) && !l.member.toLowerCase().includes(q) && !(typeCfg(l.type).label).includes(q)) return false;
    return true;
  });
  logs.sort((a,b)=>{
    const da=`${a.date} ${a.time}`, db=`${b.date} ${b.time}`;
    if(sort==='newest')  return db.localeCompare(da);
    if(sort==='oldest')  return da.localeCompare(db);
    return a.member.localeCompare(b.member,'ko');
  });
  return logs;
}
function renderLogTable(){
  const logs=filteredLogs();
  document.getElementById('tblCount').textContent=logs.length+'건';
  const body=document.getElementById('logTableBody');
  if(!logs.length){
    body.innerHTML='<div class="table-empty"><i class="ti ti-mood-empty"></i>로그가 없습니다.</div>'; return;
  }
  body.innerHTML=logs.map(log=>{
    const tc=typeCfg(log.type);
    return `
      <div class="alt-row" onclick="openDrawer('${log.id}')">
        <div class="alt-cell alt-type">
          <span class="log-type-badge ${tc.cls}">${tc.label}</span>
        </div>
        <div class="alt-cell alt-member">
          <div class="alt-member-wrap">
            <div class="alt-av" style="background:${memberColor(log.member)};">${initials(log.member)}</div>
            <div class="alt-name">${log.member}</div>
          </div>
        </div>
        <div class="alt-cell alt-title">
          <div class="alt-title-wrap">
            <div class="alt-title-text">${log.title}</div>
            <div class="alt-title-sub">${log.content}</div>
          </div>
        </div>
        <div class="alt-cell alt-date">
          <div class="alt-date-wrap">
            <div class="alt-date-main">${formatDate(log.date)}</div>
            <div class="alt-date-time">${log.time}</div>
          </div>
        </div>
        <div class="alt-cell alt-status">
          <span class="status-pill" style="${statusStyle(log.status)}">${log.status}</span>
        </div>
        <div class="alt-cell alt-actions" onclick="event.stopPropagation()">
          <button class="alt-detail-btn" onclick="openDrawer('${log.id}')" title="상세 보기"><i class="ti ti-chevron-right"></i></button>
        </div>
      </div>`;
  }).join('');
}
function populateTblMemberFilter(){
  const sel=document.getElementById('tblMemberFilter');
  if(sel.options.length>1) return;
  TEAM_MEMBERS.forEach(m=>{ const o=document.createElement('option'); o.value=m.name; o.textContent=m.name; sel.appendChild(o); });
}

/* ── 드로어 ─────────────────────────────────────── */
function openDrawer(logId){
  const log=ALL_LOGS.find(l=>l.id===logId); if(!log) return;
  currentLogId=logId;
  const tc=typeCfg(log.type);
  // header
  document.getElementById('drawerHeaderInfo').innerHTML=`
    <div class="dh-type-row">
      <div class="dh-type-ic" style="background:${tc.color}18;"><i class="ti ${tc.icon}" style="color:${tc.color};font-size:16px;"></i></div>
      <div>
        <div class="dh-title">${log.title}</div>
        <div class="dh-sub">${tc.label} · ${log.member} · ${formatDate(log.date)} ${log.time}</div>
      </div>
    </div>`;
  // body
  const detailFields=Object.entries(log.detail||{}).filter(([k,v])=>v!==undefined&&v!=='');
  const detailHTML=detailFields.length?`
    <div class="drawer-section">
      <div class="ds-title">세부 정보</div>
      <div class="ds-content">
        <div class="ds-field">
          ${detailFields.map(([k,v])=>`<div class="ds-field-key">${k}</div><div class="ds-field-val">${v}</div>`).join('')}
        </div>
      </div>
    </div>`:'';

  document.getElementById('drawerBody').innerHTML=`
    <div class="drawer-section">
      <div class="ds-title">기본 정보</div>
      <div class="ds-content">
        <div class="ds-field">
          <div class="ds-field-key">유형</div><div class="ds-field-val"><span class="log-type-badge ${tc.cls}">${tc.label}</span></div>
          <div class="ds-field-key">작성자</div><div class="ds-field-val">${log.member}</div>
          <div class="ds-field-key">날짜</div><div class="ds-field-val">${formatDate(log.date)}</div>
          <div class="ds-field-key">시간</div><div class="ds-field-val">${log.time}</div>
          <div class="ds-field-key">상태</div><div class="ds-field-val"><span class="status-pill" style="${statusStyle(log.status)}">${log.status}</span></div>
        </div>
      </div>
    </div>
    <div class="drawer-section">
      <div class="ds-title">내용</div>
      <div class="ds-content">${log.content}</div>
    </div>
    ${detailHTML}`;

  document.getElementById('drawerBackdrop').classList.add('open');
  document.getElementById('drawer').classList.add('open');
}
function closeDrawer(){
  document.getElementById('drawerBackdrop').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
}

/* ── 검색 ───────────────────────────────────────── */
document.getElementById('logSearch').addEventListener('input',()=>{ renderTimeline(); renderLogTable(); });

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  applyStoredDark(); applyStoredSidebar();
  document.getElementById('alSelectedDate').textContent=formatDate(selectedDate);
  renderAll();
});
