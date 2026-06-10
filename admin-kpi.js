/* =====================================================
   INSPIRE — admin-kpi.css
===================================================== */

/* ── Page Layout ───────────────────────────────────── */
.akpi-content {
  flex: 1; display: flex; flex-direction: column;
  gap: 12px; overflow-y: auto; min-height: 0;
}
.akpi-content::-webkit-scrollbar { width: 4px; }
.akpi-content::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 2px; }

/* ── Summary Strip ─────────────────────────────────── */
.akpi-summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0,1fr));
  gap: 8px; flex-shrink: 0;
}
.aks-card {
  background: var(--card-bg); border: .5px solid var(--card-border);
  border-radius: 9px; padding: 10px 12px;
  display: flex; align-items: center; gap: 9px;
}
.aks-ic {
  width: 30px; height: 30px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.aks-ic i { font-size: 15px; }
.aks-ic.purple { background: var(--purple-bg); color: var(--purple-t); }
.aks-ic.blue   { background: var(--info-bg);   color: var(--info-t); }
.aks-ic.green  { background: var(--ok-bg);     color: var(--ok-t); }
.aks-ic.amber  { background: var(--warn-bg);   color: var(--warn-t); }
.aks-ic.red    { background: var(--danger-bg); color: var(--danger-t); }
.aks-ic.gray   { background: var(--gray-bg);   color: var(--sb-muted); }
.aks-label { font-size: 10px; color: var(--text-sec); margin-bottom: 2px; }
.aks-val   { font-size: 17px; font-weight: 500; color: var(--text-primary); line-height: 1; }
.aks-sub   { font-size: 9px; color: var(--sb-muted); margin-top: 2px; }

/* ── Charts Row ────────────────────────────────────── */
.akpi-charts-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-shrink: 0;
}
.akpi-chart-card { overflow: hidden; }

/* Member Compare Chart */
.member-compare-area {
  padding: 12px 16px 14px;
  display: flex; flex-direction: column; gap: 10px;
  overflow-y: auto; max-height: 240px;
}
.member-compare-area::-webkit-scrollbar { width: 3px; }
.member-compare-area::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 2px; }

.mc-compare-row { display: flex; align-items: center; gap: 10px; }
.mc-compare-av  {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 600; color: #fff; flex-shrink: 0;
}
.mc-compare-info { flex: 1; min-width: 0; }
.mc-compare-name { font-size: 11px; font-weight: 500; color: var(--text-primary); margin-bottom: 3px; }
.mc-kpi-bars     { display: flex; flex-direction: column; gap: 3px; }
.mc-kpi-bar-row  { display: flex; align-items: center; gap: 6px; }
.mc-kpi-bar-label{ font-size: 9px; color: var(--sb-muted); width: 80px; min-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-kpi-track    { flex: 1; height: 6px; background: var(--gray-bg); border-radius: 3px; overflow: hidden; }
.mc-kpi-fill     { height: 6px; border-radius: 3px; transition: width .5s; }
.mc-kpi-pct      { font-size: 9px; font-weight: 500; width: 26px; text-align: right; flex-shrink: 0; }
.mc-compare-avg  { font-size: 12px; font-weight: 500; text-align: right; min-width: 36px; flex-shrink: 0; }

/* Trend Chart */
.trend-area {
  padding: 12px 16px 8px;
  display: flex; flex-direction: column; gap: 8px;
  overflow-y: auto; max-height: 220px;
}
.trend-area::-webkit-scrollbar { width: 3px; }
.trend-area::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 2px; }

.trend-row   { display: flex; align-items: center; gap: 8px; }
.trend-label { font-size: 11px; color: var(--text-sec); width: 120px; min-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trend-bars  { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.trend-bar-line { display: flex; align-items: center; gap: 5px; }
.trend-bar-tag  { font-size: 9px; color: var(--sb-muted); width: 14px; flex-shrink: 0; }
.trend-track    { flex: 1; height: 6px; background: var(--gray-bg); border-radius: 3px; overflow: hidden; }
.trend-fill     { height: 6px; border-radius: 3px; transition: width .5s; }
.trend-pct      { font-size: 9px; width: 28px; text-align: right; flex-shrink: 0; }
.trend-diff-pos { color: #16a34a; font-size: 9px; margin-left: 2px; }
.trend-diff-neg { color: #dc2626; font-size: 9px; margin-left: 2px; }
.trend-legend   {
  display: flex; gap: 12px; padding: 6px 16px 10px;
  border-top: .5px solid var(--card-border);
}
.trend-leg-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--text-sec); }
.trend-leg-dot  { width: 8px; height: 8px; border-radius: 2px; }

/* ── Toolbar ───────────────────────────────────────── */
.akpi-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; flex-shrink: 0;
}
.toolbar-left  { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 7px; }
.filter-sel {
  padding: 6px 10px; border: .5px solid var(--card-border); border-radius: 7px;
  background: var(--card-bg); color: var(--text-primary); font-size: 11px;
  font-family: inherit; outline: none; cursor: pointer;
}
.selected-count { font-size: 11px; color: var(--text-sec); white-space: nowrap; }
.bulk-btn {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 5px 11px; border-radius: 6px;
  border: .5px solid; cursor: pointer; font-family: inherit; font-weight: 500;
  transition: opacity .15s; white-space: nowrap;
}
.bulk-btn i { font-size: 13px; }
.bulk-btn:hover { opacity: .85; }
.bulk-approve { background: var(--ok-bg);     color: var(--ok-t);     border-color: var(--ok-b); }
.bulk-review  { background: var(--warn-bg);   color: var(--warn-t);   border-color: var(--warn-b); }
.bulk-reject  { background: var(--danger-bg); color: var(--danger-t); border-color: var(--danger-b); }
.bulk-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Table ─────────────────────────────────────────── */
.akpi-table-wrap {
  flex: 1; overflow: auto; min-height: 0;
  background: var(--card-bg); border: .5px solid var(--card-border);
  border-radius: 10px;
}
.akpi-table-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
.akpi-table-wrap::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 2px; }
.akpi-table { min-width: 860px; }

.at-head {
  display: grid;
  grid-template-columns: 36px 110px 1fr 90px 130px 100px 90px 70px 110px;
  padding: 9px 14px; border-bottom: .5px solid var(--card-border);
  background: var(--gray-bg); position: sticky; top: 0; z-index: 2;
}
.at-head .at-cell {
  font-size: 10px; font-weight: 500; color: var(--sb-muted);
  text-transform: uppercase; letter-spacing: .04em;
}

.at-row {
  display: grid;
  grid-template-columns: 36px 110px 1fr 90px 130px 100px 90px 70px 110px;
  padding: 10px 14px; border-bottom: .5px solid var(--card-border);
  align-items: center; transition: background .1s;
}
.at-row:last-child { border-bottom: none; }
.at-row:hover { background: var(--sb-hover); }
.at-row.selected { background: var(--purple-bg); }

.at-cell { font-size: 12px; color: var(--text-primary); }
.at-check input[type="checkbox"] { cursor: pointer; accent-color: #7c3aed; width: 14px; height: 14px; }

/* member cell */
.at-member-info { display: flex; align-items: center; gap: 6px; }
.at-av { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 600; color: #fff; flex-shrink: 0; }
.at-name { font-size: 11px; font-weight: 500; color: var(--text-primary); }

/* title cell */
.at-title-wrap { min-width: 0; }
.at-title-text { font-size: 12px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.at-title-desc { font-size: 10px; color: var(--sb-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* status select in table */
.at-status-sel {
  padding: 4px 7px; border-radius: 6px; border: .5px solid var(--card-border);
  background: var(--card-bg); color: var(--text-primary);
  font-size: 11px; font-family: inherit; outline: none; cursor: pointer;
  width: 100%;
}

/* progress cell */
.at-prog-wrap { display: flex; flex-direction: column; gap: 3px; }
.at-prog-bar  { display: flex; align-items: center; gap: 5px; }
.at-prog-track{ flex: 1; height: 5px; background: var(--gray-bg); border-radius: 3px; overflow: hidden; }
.at-prog-fill { height: 5px; border-radius: 3px; transition: width .4s; }
.at-prog-pct  { font-size: 10px; font-weight: 500; width: 28px; text-align: right; flex-shrink: 0; }

/* target cell */
.at-target-wrap { display: flex; flex-direction: column; gap: 1px; }
.at-target-nums { font-size: 11px; color: var(--text-primary); }
.at-target-metric{ font-size: 9px; color: var(--sb-muted); }

/* due cell */
.at-due-text { font-size: 11px; }
.at-due-urgent { color: #dc2626; font-weight: 500; }
.at-due-soon   { color: #d97706; }
.at-due-ok     { color: var(--text-sec); }

/* fb cell */
.at-fb-count { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--sb-muted); cursor: pointer; }
.at-fb-count:hover { color: var(--purple-t); }
.at-fb-count i { font-size: 13px; }
.at-fb-has { color: var(--purple-t); font-weight: 500; }

/* action cell */
.at-action-btns { display: flex; gap: 4px; }
.at-action-btn {
  width: 24px; height: 24px; border-radius: 5px;
  border: .5px solid var(--card-border); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--sb-muted); transition: background .15s, color .15s;
}
.at-action-btn:hover { background: var(--sb-hover); }
.at-action-btn.edit:hover   { background: var(--purple-bg); color: var(--purple-t); }
.at-action-btn.fb:hover     { background: var(--ok-bg);     color: var(--ok-t); }
.at-action-btn.approve:hover{ background: var(--ok-bg);     color: var(--ok-t); }
.at-action-btn i { font-size: 13px; }

/* empty state */
.at-empty {
  padding: 56px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: var(--text-sec); font-size: 12px;
}
.at-empty i { font-size: 36px; color: var(--card-border); }

/* status badges */
.kpi-st-before    { background:#f1f5f9;           color:#475569;          border:.5px solid #cbd5e1; }
.kpi-st-inprogress{ background:var(--info-bg);    color:var(--info-t);    border:.5px solid var(--info-b); }
.kpi-st-review    { background:var(--warn-bg);    color:var(--warn-t);    border:.5px solid var(--warn-b); }
.kpi-st-done      { background:var(--ok-bg);      color:var(--ok-t);      border:.5px solid var(--ok-b); }
.kpi-st-rejected  { background:var(--danger-bg);  color:var(--danger-t);  border:.5px solid var(--danger-b); }

/* feedback thread in modal */
.fb-bubble {
  display: flex; gap: 8px; padding: 9px 10px;
  background: var(--gray-bg); border-radius: 8px;
}
.fb-b-av   { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: #fff; flex-shrink: 0; }
.fb-b-name { font-size: 11px; font-weight: 500; color: var(--text-primary); }
.fb-b-text { font-size: 11px; color: var(--text-primary); line-height: 1.5; margin-top: 3px; }
.fb-b-time { font-size: 10px; color: var(--sb-muted); margin-top: 2px; }
.rating-badge {
  font-size: 9px; padding: 1px 6px; border-radius: 6px; border: .5px solid; font-weight: 500;
}
.rating-excellent { background: var(--ok-bg);   color: var(--ok-t);   border-color: var(--ok-b); }
.rating-good      { background: var(--info-bg); color: var(--info-t); border-color: var(--info-b); }
.rating-needs     { background: var(--warn-bg); color: var(--warn-t); border-color: var(--warn-b); }
.action-approved  { background: var(--ok-bg);     color: var(--ok-t);     border-color: var(--ok-b); }
.action-revision  { background: var(--warn-bg);   color: var(--warn-t);   border-color: var(--warn-b); }
.action-rejected  { background: var(--danger-bg); color: var(--danger-t); border-color: var(--danger-b); }
.action-comment   { background: var(--gray-bg);   color: var(--gray-t);   border-color: var(--gray-b); }

/* modal */
.modal-backdrop { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1000; align-items:center; justify-content:center; }
.modal-backdrop.open { display:flex; }
.modal { background:var(--card-bg); border:.5px solid var(--card-border); border-radius:14px; max-width:95vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:.5px solid var(--card-border); flex-shrink:0; }
.modal-title  { font-size:14px; font-weight:500; color:var(--text-primary); }
.modal-close  { width:26px; height:26px; border-radius:6px; border:.5px solid var(--card-border); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-sec); }
.modal-close:hover { background:var(--sb-hover); }
.modal-close i { font-size:14px; }
.modal-body   { padding:16px 18px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; flex:1; }
.form-group   { display:flex; flex-direction:column; gap:5px; }
