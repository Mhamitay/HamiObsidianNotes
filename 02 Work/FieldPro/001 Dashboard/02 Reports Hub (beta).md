---
title: Reports Hub (beta)
type: dashboard
---

# 🧪 Reports Hub (beta)

> **Sandbox — experiment file.** Wins rules and Copy-as-Markdown still mirror the real hub. New in this pass: a progress-led **What I Worked On** view and a dated **Wins** timeline. The **📈 Charts** section (free *Charts* plugin — Chart.js) and **📅 Activity Calendar** (free *Tracker* plugin — month views) are also enabled; restart Obsidian once to load them, then open this note.

## 📅 Activity Calendar

> Two Tracker month views, like the reference dashboard: **Wins** (days where you logged a `#win`) and **Days logged** (any daily note). Use the arrows in each panel's header to flip months; colors scale with intensity.

**🏆 Wins**


**✅ Days logged**

```tracker
searchType: frontmatter.exists
searchTarget: date
folder: 02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes
dateFormat: YYYY-MM-DD
month:
  initMonth: 2026-09
  startWeekOn: Mon
  color: '#3f7fe0'
```

```dataviewjs
// =====================================================================
// REPORTS HUB (beta) — experiment file for the Charts section
// =====================================================================
const DAILY_NOTES = "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes";
const BUGS_FOLDER = "02 Work/FieldPro/04 Lessons Learned/Bugs Fixed";
const WIN_TAG = "#win";

const state = (window.__betaReportsState = window.__betaReportsState || { period: "week", offset: 0 });

// ---------- styling ----------
if (!document.getElementById("reports-hub-beta-style")) {
  const s = document.createElement("style");
  s.id = "reports-hub-beta-style";
  s.textContent = `
.reports-hub .toolbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:12px 0;}
.reports-hub .btn{padding:5px 12px;border-radius:8px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);cursor:pointer;font-size:13px;}
.reports-hub .btn:hover{border-color:var(--interactive-accent);}
.reports-hub .btn.active{background:var(--interactive-accent);color:var(--text-on-accent);border-color:transparent;}
.reports-hub .btn:focus-visible,.reports-hub .source-link:focus-visible{outline:2px solid var(--interactive-accent);outline-offset:2px;}
.reports-hub .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:12px 0;}
.reports-hub .card{padding:12px 14px;border-radius:10px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);}
.reports-hub .card .lbl{color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:.05em;}
.reports-hub .card .val{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;}
.reports-hub h3.rh{font-size:16px;margin:22px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .rh-heading{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-top:24px;padding-bottom:7px;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .rh-heading h3.rh{margin:0;padding:0;border:0;}
.reports-hub .rh-meta{color:var(--text-muted);font-size:12px;text-align:right;}
.reports-hub .empty{color:var(--text-muted);font-style:italic;padding:12px 0;}
.reports-hub .row{font-size:14px;line-height:1.5;padding:2px 0;}
.reports-hub .src{color:var(--text-muted);font-size:12px;}
.reports-hub .row.link{cursor:pointer;border-radius:6px;padding:3px 6px;margin:0 -6px;}
.reports-hub .row.link:hover{background:var(--background-modifier-hover);}
.reports-hub .row.link .go{color:var(--text-accent);font-size:12px;}
.reports-hub .row.link:hover .src{color:var(--text-normal);text-decoration:underline;}
.reports-hub .note-ref{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;}
.reports-hub .work-ledger{display:grid;grid-template-columns:minmax(190px,1.4fr) repeat(3,minmax(68px,.45fr));align-items:center;gap:18px;padding:14px 0;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .work-progress-label{display:flex;justify-content:space-between;gap:12px;margin-bottom:8px;font-size:12px;}
.reports-hub .work-progress-label span{color:var(--text-muted);}
.reports-hub .work-progress-label strong{font-variant-numeric:tabular-nums;}
.reports-hub .work-track{height:7px;overflow:hidden;border-radius:999px;background:var(--background-modifier-border);}
.reports-hub .work-track>span{display:block;height:100%;border-radius:inherit;background:var(--interactive-accent);}
.reports-hub .work-metric{padding-left:14px;border-left:1px solid var(--background-modifier-border);}
.reports-hub .work-metric strong{display:block;font-size:20px;line-height:1.1;font-variant-numeric:tabular-nums;}
.reports-hub .work-metric span{display:block;margin-top:3px;color:var(--text-muted);font-size:11px;}
.reports-hub .work-metric.done strong{color:#2ea56b;}
.reports-hub .work-group{padding:14px 0 12px;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .work-group-head{display:grid;grid-template-columns:minmax(150px,auto) minmax(90px,1fr) auto;align-items:center;gap:16px;margin-bottom:8px;}
.reports-hub .work-group-title{font-size:13px;font-weight:750;}
.reports-hub .work-group-title span{color:var(--text-muted);font-weight:500;}
.reports-hub .work-group-track{height:4px;overflow:hidden;border-radius:999px;background:var(--background-modifier-border);}
.reports-hub .work-group-track>span{display:block;height:100%;border-radius:inherit;background:var(--interactive-accent);}
.reports-hub .work-group-meta{color:var(--text-muted);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums;}
.reports-hub .work-items{display:grid;gap:3px;}
.reports-hub .work-row{display:grid;grid-template-columns:18px 84px minmax(0,1fr) auto;align-items:start;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1.45;}
.reports-hub .work-row:hover{background:var(--background-modifier-hover);}
.reports-hub .work-row .status{font-weight:800;text-align:center;}
.reports-hub .work-row.done .status{color:#2ea56b;}
.reports-hub .work-row.open .status{color:var(--text-muted);}
.reports-hub .work-row.note .status{color:var(--text-faint);}
.reports-hub .work-row .day{color:var(--text-muted);font-size:11px;padding-top:1px;white-space:nowrap;}
.reports-hub .work-row .item-copy{min-width:0;overflow-wrap:anywhere;}
.reports-hub .work-row .src{font-size:11px;}
.reports-hub .win-ledger{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .win-count{font-size:34px;font-weight:800;line-height:1;color:var(--text-accent);font-variant-numeric:tabular-nums;}
.reports-hub .win-copy strong{display:block;margin-bottom:3px;}
.reports-hub .win-copy span{color:var(--text-muted);font-size:12px;}
.reports-hub .win-stats{display:flex;align-items:center;gap:18px;}
.reports-hub .win-stat{padding-left:16px;border-left:1px solid var(--background-modifier-border);}
.reports-hub .win-stat strong{display:block;font-size:18px;line-height:1.1;font-variant-numeric:tabular-nums;}
.reports-hub .win-stat span{display:block;margin-top:3px;color:var(--text-muted);font-size:11px;}
.reports-hub .win-timeline{position:relative;margin-top:14px;}
.reports-hub .win-timeline::before{content:"";position:absolute;top:12px;bottom:12px;left:47px;width:1px;background:var(--background-modifier-border);}
.reports-hub .win-day{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr);gap:18px;padding-bottom:15px;}
.reports-hub .win-date{position:relative;padding-top:1px;text-align:right;}
.reports-hub .win-date .dow{display:block;color:var(--text-muted);font-size:10px;text-transform:uppercase;}
.reports-hub .win-date .date{display:block;margin-top:2px;font-size:12px;font-weight:750;}
.reports-hub .win-date::after{content:"";position:absolute;top:4px;left:calc(100% - 13.5px);width:9px;height:9px;border-radius:50%;background:#d7a93e;box-shadow:0 0 0 4px var(--background-primary);}
.reports-hub .win-day-body{min-width:0;padding-top:5px;border-top:1px solid var(--background-modifier-border);}
.reports-hub .win-day-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:12px;font-weight:700;}
.reports-hub .win-day-title span{color:var(--text-muted);font-size:11px;font-weight:500;}
.reports-hub .win-items{display:grid;gap:5px;margin-top:8px;}
.reports-hub .win-item{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:start;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1.45;}
.reports-hub .win-item:hover{background:var(--background-modifier-hover);}
.reports-hub .win-check{color:#2ea56b;font-weight:800;text-align:center;}
.reports-hub .win-item .win-copy{min-width:0;overflow-wrap:anywhere;}
.reports-hub .win-item .src{font-size:11px;}
.reports-hub .win-overflow{margin-top:8px;color:var(--text-muted);font-size:12px;}
.reports-hub .charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;margin:12px 0;}
.reports-hub .chbox{padding:12px 14px;border-radius:10px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);}
.reports-hub .chbox .cht{color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:.05em;margin-bottom:6px;}
.reports-hub .chbox .ch{position:relative;height:210px;}
.reports-hub .nocharts{padding:10px 12px;margin:12px 0;border:1px dashed var(--background-modifier-border);border-radius:10px;color:var(--text-muted);font-size:13px;}
@media(max-width:640px){
.reports-hub .rh-heading{align-items:flex-start;flex-direction:column;gap:4px;}
.reports-hub .rh-meta{text-align:left;}
.reports-hub .work-ledger{grid-template-columns:repeat(3,1fr);gap:12px;}
.reports-hub .work-progress{grid-column:1/-1;}
.reports-hub .work-metric{padding-left:10px;}
.reports-hub .work-group-head{grid-template-columns:minmax(0,1fr) auto;gap:8px;}
.reports-hub .work-group-track{grid-column:1/-1;grid-row:2;}
.reports-hub .work-row{grid-template-columns:18px minmax(0,1fr) auto;}
.reports-hub .work-row .day{grid-column:2;grid-row:1;}
.reports-hub .work-row .item-copy{grid-column:2;grid-row:2;}
.reports-hub .work-row .note-ref{grid-column:3;grid-row:1/3;}
.reports-hub .win-ledger{grid-template-columns:auto minmax(0,1fr);}
.reports-hub .win-stats{grid-column:1/-1;padding-top:10px;border-top:1px solid var(--background-modifier-border);}
.reports-hub .win-stat:first-child{padding-left:0;border-left:0;}
.reports-hub .win-timeline::before{left:39px;}
.reports-hub .win-day{grid-template-columns:36px minmax(0,1fr);gap:14px;}
.reports-hub .win-item{grid-template-columns:16px minmax(0,1fr);}
.reports-hub .win-item .note-ref{grid-column:2;}
}
`;
  document.head.appendChild(s);
}

// ---------- data ----------
const pages = dv.pages(`"${DAILY_NOTES}"`)
  .where(p => p && p.file && p.file.name && /^\d{4}-\d{2}-\d{2}$/.test(p.file.name))
  .array();
const dateOf = p => window.moment(p.file.name, "YYYY-MM-DD", true).startOf("day");
const daily = pages.filter(p => dateOf(p).isValid()).sort((a, b) => dateOf(a).valueOf() - dateOf(b).valueOf());

const today = window.moment().startOf("day");

function rangeFor() {
  let start, end, label;
  const period = state.period;
  if (period === "all") {
    start = daily.length ? dateOf(daily[0]).clone() : today.clone();
    end = today.clone().add(1, "day");
    label = "All Time";
  } else if (period === "week") {
    start = today.clone().add(state.offset, "weeks").startOf("isoWeek");
    end = start.clone().add(1, "week");
    label = start.format("MMM D") + " – " + end.clone().subtract(1, "day").format("MMM D, YYYY");
  } else if (period === "month") {
    start = today.clone().add(state.offset, "months").startOf("month");
    end = start.clone().add(1, "month");
    label = start.format("MMMM YYYY");
  } else {
    start = today.clone().add(state.offset, "years").startOf("year");
    end = start.clone().add(1, "year");
    label = start.format("YYYY");
  }
  return { start, end, label, period };
}

function inPeriod(start, end, p) {
  const d = dateOf(p);
  return d.valueOf() >= start.valueOf() && d.valueOf() < end.valueOf();
}

const sectionItems = p => (p.file.lists || []).filter(i => {
  const heading = i && i.section && i.section.subpath ? i.section.subpath.trim() : "";
  return /\bToday(?:['’]s(?:\s+Tasks?)?|\s+Tasks?)?$/i.test(heading);
});
const allItems = p => (p.file.lists || []);
const parseSec = i => (i.section && i.section.subpath || "").trim().toLowerCase();
const isWinTask = i => {
  const sec = parseSec(i);
  return (i.text && i.text.toLowerCase().includes(WIN_TAG)) || /\bwins?\b/i.test(sec) || sec.includes("🏆");
};
const cleanText = i => {
  const t = (i.text || "").replace(/✅.*$/, "").trim();
  if (!t || /^[-–—\s]*$/.test(t)) return "";
  if (/^-\s*\[/.test(t)) return "";
  return t;
};
const workItemOf = t => {
  const s = String(t || "").replace(/https?:\/\/\S+/g, " ");
  let m = s.match(/(?:#wi[\s-]?|WI[\s-]?)(\d{3,6})/i);
  if (m) return m[1];
  m = s.match(/#(\d{3,6})/);
  if (m) return m[1];
  m = s.match(/\*\*(\d{3,6})\*\*/);
  if (m) return m[1];
  m = s.match(/\b(\d{4})\b/);
  if (m && m[1] !== "2026") return m[1];
  return null;
};

function collect() {
  const { start, end, label, period } = rangeFor();
  const periodPages = daily.filter(p => inPeriod(start, end, p));

  const work = [];
  const doneTasks = [];
  const wonTasks = [];
  const winLines = [];
  const lessons = [];
  const impacts = [];
  const dayMap = new Map();
  let allTasks = 0;

  for (const p of periodPages) {
    const dstr = dateOf(p).format("ddd, MMM D");
    const dkey = dateOf(p).format("YYYY-MM-DD");
    if (!dayMap.has(dkey)) dayMap.set(dkey, { items: 0, total: 0, done: 0 });
    const rec = dayMap.get(dkey);
    const seen = new Set();

    for (const i of allItems(p)) {
      if (i.task) {
        allTasks++;
        rec.total++;
        if (i.completed) {
          rec.done++;
          const text = cleanText(i);
          if (text) {
            const key = dstr + text;
            if (!seen.has(key)) {
              seen.add(key);
              doneTasks.push({ date: dstr, dateKey: dkey, text, link: p.file.link });
              if (isWinTask(i)) wonTasks.push({ date: dstr, dateKey: dkey, text, link: p.file.link });
            }
          }
        }
      }
      if (!i.task && i.text && i.text.trim()) {
        if (i.section && i.section.subpath && i.section.subpath.trim().toUpperCase().includes("LESSON")) {
          lessons.push({ date: dstr, text: i.text, link: p.file.link });
        }
        if (i.section && i.section.subpath && /impact/i.test(i.section.subpath) && !/^[-–—\s]*$/.test(i.text.trim())) {
          impacts.push({ date: dstr, text: i.text.trim(), link: p.file.link });
        }
        if (i.text.toLowerCase().includes(WIN_TAG)) {
          winLines.push({ date: dstr, dateKey: dkey, text: i.text, link: p.file.link });
        }
      }
    }

    for (const i of sectionItems(p)) {
      const text = cleanText(i);
      if (text) {
        rec.items++;
        work.push({ date: dstr, dateKey: dkey, text, ticket: workItemOf(text), task: i.task, done: i.completed, link: p.file.link });
      }
    }
  }

  const bugs = dv.pages(`"${BUGS_FOLDER}"`).array().filter(b => {
    const m = window.moment(b.file.mtime);
    return m.valueOf() >= start.valueOf() && m.valueOf() < end.valueOf();
  }).map(b => ({ date: window.moment(b.file.mtime).format("MMM D"), link: b.file.link }));

  // timeline buckets: days for week/month, months for year/all
  const unit = period === "year" || period === "all" ? "month" : "day";
  const buckets = new Map();
  const cur = start.clone();
  while (cur.valueOf() < end.valueOf()) {
    const key = unit === "day" ? cur.format("MMM D") : cur.format("MMM YYYY");
    if (!buckets.has(key)) buckets.set(key, { items: 0, done: 0, open: 0 });
    const rec = dayMap.get(cur.format("YYYY-MM-DD"));
    if (rec) {
      const b = buckets.get(key);
      b.items += rec.items;
      b.done += rec.done;
      b.open += rec.total - rec.done;
    }
    cur.add(1, "day");
  }
  const timeline = [...buckets].map(([label, b]) => ({ label, ...b }));

  const workDone = work.filter(w => w.task && w.done).length;
  const workOpen = work.filter(w => w.task && !w.done).length;
  const workNotes = work.filter(w => !w.task).length;

  return { start, end, label, period, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs, allTasks, timeline, workDone, workOpen, workNotes };
}

// ---------- render ----------
const root = dv.el("div", "", { cls: "reports-hub" });

const cssVar = v => (getComputedStyle(document.body).getPropertyValue(v) || "").trim();
const rgba = (hex, a) => {
  const m = String(hex || "").match(/^#?([0-9a-f]{6})$/i);
  if (!m) return String(a === undefined ? hex : hex);
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

function linkToNote(el, link, sourceText) {
  if (!link || !link.path) return el;
  el.classList.add("link");
  el.classList.add("source-link");
  el.tabIndex = 0;
  el.title = "Open note → " + link.path;
  el.setAttribute("role", "link");
  el.setAttribute("aria-label", "Open source note " + link.path);
  el.onclick = e => {
    e.preventDefault();
    app.workspace.openLinkText(link.path, "", true);
  };
  el.onkeydown = e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  };
  const ref = document.createElement("span");
  ref.className = "note-ref";
  const src = document.createElement("span");
  src.className = "src";
  src.textContent = sourceText || link.path;
  const go = document.createElement("span");
  go.className = "go";
  go.textContent = "↗";
  ref.append(src, go);
  el.appendChild(ref);
  return el;
}

function icon(t, b) {
  const el = document.createElement("div");
  el.className = "row";
  const copy = document.createElement("span");
  copy.textContent = t;
  el.appendChild(copy);
  return linkToNote(el, b);
}

// ---------- charts ----------
function drawChart(host, chartOptions) {
  if (!host || !window.renderChart) return false;
  try {
    window.renderChart({ chartOptions, width: "100%" }, host);
    return true;
  } catch (err) {
    host.textContent = "chart error: " + err.message;
    return true;
  }
}

function chartSkin(logLegend) {
  const gridC = cssVar("--background-modifier-border") || "#cccccc";
  const tickC = cssVar("--text-muted") || "#888";
  const fontFam = (cssVar("--mermaid-font") || cssVar("--font-interface") || "sans-serif").replace(/['"]/g, "");
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: !!logLegend, position: "bottom", labels: { color: tickC, font: { family: fontFam, size: 11 } } },
      tooltip: { backgroundColor: "rgba(0,0,0,.82)" }
    }
  };
  return {
    base,
    scales: {
      x: { grid: { color: gridC }, ticks: { color: tickC, font: { family: fontFam, size: 10 } }, border: { color: gridC } },
      y: { beginAtZero: true, grid: { color: gridC }, ticks: { color: tickC, font: { family: fontFam, size: 10 } }, border: { color: gridC } }
    }
  };
}

function renderCharts(d) {
  const acc = cssVar("--interactive-accent") || "#3d74c8";
  const mute = cssVar("--text-muted") || "#8a94a6";
  const done = "#2ea56b";
  const skin = chartSkin;

  const grid = document.createElement("div");
  grid.className = "charts";

  if (!window.renderChart) {
    const banner = document.createElement("div");
    banner.className = "nocharts";
    banner.textContent = "Charts plugin isn't loaded yet — restart Obsidian (or enable 'Charts' in Settings → Community plugins), and reload this note.";
    root.appendChild(banner);
    return;
  }

  // 1 // activity line
  const c1 = mkBox("WORK ITEMS PER " + (d.period === "year" || d.period === "all" ? "MONTH" : "DAY"));
  grid.appendChild(c1.box);
  drawChart(c1.host, {
    type: "line",
    data: { labels: d.timeline.map(t => t.label), datasets: [{
      label: "Work items", data: d.timeline.map(t => t.items),
      borderColor: acc, backgroundColor: rgba(acc, 0.14), fill: true,
      tension: 0.3, pointRadius: 3, borderWidth: 2
    }] },
    options: { ...skin().base, scales: skin().scales }
  });

  // 2 // done vs open (stacked bars)
  const c2 = mkBox("TASKS DONE vs OPEN PER " + (d.period === "year" || d.period === "all" ? "MONTH" : "DAY"));
  grid.appendChild(c2.box);
  drawChart(c2.host, {
    type: "bar",
    data: { labels: d.timeline.map(t => t.label), datasets: [
      { label: "Done", data: d.timeline.map(t => t.done), backgroundColor: done },
      { label: "Open", data: d.timeline.map(t => t.open), backgroundColor: mute }
    ] },
    options: {
      ...skin().base,
      scales: { ...skin().scales,
        x: { ...skin().scales.x, stacked: true },
        y: { ...skin().scales.y, stacked: true }
      }
    }
  });

  // 3 // work mix doughnut
  const c3 = mkBox("WORK MIX");
  grid.appendChild(c3.box);
  drawChart(c3.host, {
    type: "doughnut",
    data: {
      labels: ["Tasks done", "Tasks open", "Notes"],
      datasets: [{ data: [d.workDone, d.workOpen, d.workNotes], backgroundColor: [done, mute, acc], borderWidth: 2, borderColor: cssVar("--background-secondary") || "#fff" }]
    },
    options: { ...skin(true).base, cutout: "62%" }
  });

  root.appendChild(grid);
}

function mkBox(title) {
  const box = document.createElement("div");
  box.className = "chbox";
  const t = document.createElement("div");
  t.className = "cht";
  t.textContent = title;
  const host = document.createElement("div");
  host.className = "ch";
  box.appendChild(t);
  box.appendChild(host);
  return { box, host };
}

function addSectionHeading(title, meta) {
  const heading = document.createElement("div");
  heading.className = "rh-heading";
  const h = document.createElement("h3");
  h.className = "rh";
  h.textContent = title;
  const summary = document.createElement("div");
  summary.className = "rh-meta";
  summary.textContent = meta;
  heading.append(h, summary);
  root.appendChild(heading);
}

function appendMetric(parent, value, label, className) {
  const metric = document.createElement("div");
  metric.className = "work-metric" + (className ? " " + className : "");
  const number = document.createElement("strong");
  number.textContent = value;
  const caption = document.createElement("span");
  caption.textContent = label;
  metric.append(number, caption);
  parent.appendChild(metric);
}

function groupWorkItems(work) {
  const groups = new Map();
  for (const item of work) {
    const key = item.ticket || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "General") return 1;
    if (b === "General") return -1;
    return Number(a) - Number(b);
  });
}

function renderWorkSection(work) {
  const groups = groupWorkItems(work);
  const done = work.filter(item => item.task && item.done).length;
  const open = work.filter(item => item.task && !item.done).length;
  const notes = work.filter(item => !item.task).length;
  const taskTotal = done + open;
  const completion = taskTotal ? Math.round(done / taskTotal * 100) : 0;
  const streamLabel = groups.length === 1 ? "workstream" : "workstreams";
  addSectionHeading("💪 What I Worked On", work.length ? `${work.length} ${work.length === 1 ? "entry" : "entries"} · ${groups.length} ${streamLabel}` : "Nothing logged yet");

  if (!work.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No work items recorded in this period. Add an item under Today in a daily note to see it here.";
    root.appendChild(empty);
    return;
  }

  const ledger = document.createElement("div");
  ledger.className = "work-ledger";
  const progress = document.createElement("div");
  progress.className = "work-progress";
  const progressLabel = document.createElement("div");
  progressLabel.className = "work-progress-label";
  const progressCaption = document.createElement("span");
  progressCaption.textContent = taskTotal ? "Task completion" : "Notes captured";
  const progressValue = document.createElement("strong");
  progressValue.textContent = taskTotal ? `${completion}%` : String(notes);
  progressLabel.append(progressCaption, progressValue);
  const track = document.createElement("div");
  track.className = "work-track";
  const fill = document.createElement("span");
  fill.style.width = (taskTotal ? completion : notes ? 100 : 0) + "%";
  track.appendChild(fill);
  progress.append(progressLabel, track);
  ledger.appendChild(progress);
  appendMetric(ledger, done, "done", "done");
  appendMetric(ledger, open, "open");
  appendMetric(ledger, notes, notes === 1 ? "note" : "notes");
  root.appendChild(ledger);

  for (const [ticket, items] of groups) {
    const group = document.createElement("section");
    group.className = "work-group";
    const head = document.createElement("div");
    head.className = "work-group-head";
    const title = document.createElement("div");
    title.className = "work-group-title";
    title.append(document.createTextNode(ticket === "General" ? "General work" : `Work item #${ticket}`));
    const count = document.createElement("span");
    count.textContent = ` · ${items.length} ${items.length === 1 ? "entry" : "entries"}`;
    title.appendChild(count);
    const groupDone = items.filter(item => item.task && item.done).length;
    const groupTasks = items.filter(item => item.task).length;
    const groupCompletion = groupTasks ? Math.round(groupDone / groupTasks * 100) : 0;
    const groupTrack = document.createElement("div");
    groupTrack.className = "work-group-track";
    const groupFill = document.createElement("span");
    groupFill.style.width = (groupTasks ? groupCompletion : 0) + "%";
    groupTrack.appendChild(groupFill);
    const meta = document.createElement("div");
    meta.className = "work-group-meta";
    meta.textContent = groupTasks ? `${groupDone}/${groupTasks} tasks done` : `${items.length} ${items.length === 1 ? "note" : "notes"}`;
    head.append(title, groupTrack, meta);
    group.appendChild(head);

    const list = document.createElement("div");
    list.className = "work-items";
    for (const item of items) {
      const row = document.createElement("div");
      const state = item.task ? (item.done ? "done" : "open") : "note";
      row.className = "work-row " + state;
      const status = document.createElement("span");
      status.className = "status";
      status.textContent = item.task ? (item.done ? "✓" : "○") : "–";
      const day = document.createElement("span");
      day.className = "day";
      day.textContent = item.date;
      const copy = document.createElement("span");
      copy.className = "item-copy";
      copy.textContent = item.text;
      row.append(status, day, copy);
      linkToNote(row, item.link, "Source note");
      list.appendChild(row);
    }
    group.appendChild(list);
    root.appendChild(group);
  }
}

function cleanWinText(text) {
  return String(text || "")
    .replace(/\b#win\b/ig, "")
    .replace(/^✅\s*/, "")
    .replace(/^[-–—]\s*/, "")
    .trim();
}

function collectWins(wonTasks, winLines) {
  const seen = new Set();
  return [
    ...wonTasks.map(win => ({ ...win })),
    ...winLines.map(win => ({ ...win }))
  ].map(win => ({ ...win, text: cleanWinText(win.text) })).filter(win => {
    if (!win.text) return false;
    const key = `${win.dateKey || win.date}|${win.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => String(b.dateKey || b.date).localeCompare(String(a.dateKey || a.date)));
}

function longestWinStreak(wins) {
  const days = [...new Set(wins.map(win => win.dateKey).filter(Boolean))].sort();
  let current = 0;
  let best = 0;
  let previous = null;
  for (const day of days) {
    current = previous && window.moment(day, "YYYY-MM-DD", true).diff(window.moment(previous, "YYYY-MM-DD", true), "day") === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}

function renderWinsSection(wonTasks, winLines) {
  const wins = collectWins(wonTasks, winLines);
  const dayCount = new Set(wins.map(win => win.dateKey).filter(Boolean)).size;
  const streak = longestWinStreak(wins);
  const winLabel = wins.length === 1 ? "win" : "wins";
  addSectionHeading("🏆 Wins", wins.length ? `${wins.length} explicit ${winLabel} in this period` : "No explicit wins yet");

  if (!wins.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No wins recorded in this period. Check off an item under Wins or tag a completed task with #win to build this timeline.";
    root.appendChild(empty);
    return;
  }

  const ledger = document.createElement("div");
  ledger.className = "win-ledger";
  const count = document.createElement("div");
  count.className = "win-count";
  count.textContent = wins.length;
  const copy = document.createElement("div");
  copy.className = "win-copy";
  const copyTitle = document.createElement("strong");
  copyTitle.textContent = `Explicit ${winLabel} captured`;
  const copyMeta = document.createElement("span");
  copyMeta.textContent = "Completed Wins entries and #win tasks only";
  copy.append(copyTitle, copyMeta);
  const stats = document.createElement("div");
  stats.className = "win-stats";
  const dayStat = document.createElement("div");
  dayStat.className = "win-stat";
  const dayValue = document.createElement("strong");
  dayValue.textContent = dayCount;
  const dayLabel = document.createElement("span");
  dayLabel.textContent = dayCount === 1 ? "winning day" : "winning days";
  dayStat.append(dayValue, dayLabel);
  const streakStat = document.createElement("div");
  streakStat.className = "win-stat";
  const streakValue = document.createElement("strong");
  streakValue.textContent = streak;
  const streakLabel = document.createElement("span");
  streakLabel.textContent = "best streak";
  streakStat.append(streakValue, streakLabel);
  stats.append(dayStat, streakStat);
  ledger.append(count, copy, stats);
  root.appendChild(ledger);

  const visibleWins = wins.slice(0, 60);
  const days = new Map();
  for (const win of visibleWins) {
    const key = win.dateKey || win.date;
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(win);
  }
  const timeline = document.createElement("div");
  timeline.className = "win-timeline";
  for (const [dateKey, items] of days) {
    const day = window.moment(dateKey, "YYYY-MM-DD", true);
    const dayWrap = document.createElement("div");
    dayWrap.className = "win-day";
    const date = document.createElement("div");
    date.className = "win-date";
    const dow = document.createElement("span");
    dow.className = "dow";
    dow.textContent = day.isValid() ? day.format("ddd") : "Date";
    const dateValue = document.createElement("span");
    dateValue.className = "date";
    dateValue.textContent = day.isValid() ? day.format("MMM D") : dateKey;
    date.append(dow, dateValue);
    const body = document.createElement("div");
    body.className = "win-day-body";
    const title = document.createElement("div");
    title.className = "win-day-title";
    const titleText = day.isValid() ? day.format("dddd, MMMM D, YYYY") : dateKey;
    title.appendChild(document.createTextNode(titleText));
    const count = document.createElement("span");
    count.textContent = `${items.length} ${items.length === 1 ? "win" : "wins"}`;
    title.appendChild(count);
    const list = document.createElement("div");
    list.className = "win-items";
    for (const win of items) {
      const item = document.createElement("div");
      item.className = "win-item";
      const check = document.createElement("span");
      check.className = "win-check";
      check.textContent = "✓";
      const itemCopy = document.createElement("span");
      itemCopy.className = "win-copy";
      itemCopy.textContent = win.text;
      item.append(check, itemCopy);
      linkToNote(item, win.link, "Source note");
      list.appendChild(item);
    }
    body.append(title, list);
    dayWrap.append(date, body);
    timeline.appendChild(dayWrap);
  }
  root.appendChild(timeline);
  if (wins.length > visibleWins.length) {
    const overflow = document.createElement("div");
    overflow.className = "win-overflow";
    overflow.textContent = `Showing the first ${visibleWins.length} of ${wins.length} wins.`;
    root.appendChild(overflow);
  }
}

// ---------- render ----------
function render() {
  root.replaceChildren();
  const d = collect();
  const { label, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs, allTasks } = d;

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  const periods = ["week", "month", "year", "all"];
  for (const p of periods) {
    const b = document.createElement("button");
    b.className = "btn" + (state.period === p ? " active" : "");
    b.textContent = p === "all" ? "All Time" : p[0].toUpperCase() + p.slice(1);
    b.onclick = () => { state.period = p; state.offset = 0; render(); };
    toolbar.appendChild(b);
  }

  const sep = document.createElement("span");
  sep.textContent = "·";
  sep.style.padding = "0 6px";
  sep.style.color = "var(--text-muted)";
  toolbar.appendChild(sep);

  const prev = document.createElement("button");
  prev.className = "btn";
  prev.textContent = "◀ Prev";
  prev.onclick = () => { state.offset--; render(); };
  toolbar.appendChild(prev);

  const nowBtn = document.createElement("button");
  nowBtn.className = "btn";
  nowBtn.textContent = "This " + (state.period === "all" ? "Time" : state.period);
  nowBtn.onclick = () => { state.offset = 0; render(); };
  toolbar.appendChild(nowBtn);

  const next = document.createElement("button");
  next.className = "btn";
  next.textContent = "Next ▶";
  next.onclick = () => { state.offset++; render(); };
  toolbar.appendChild(next);

  const copy = document.createElement("button");
  copy.className = "btn";
  copy.textContent = "📋 Copy as Markdown";
  copy.onclick = () => {
    const md = buildMarkdown(label, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs);
    const fallback = text => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      new Notice("Copied " + label + " report to clipboard.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => new Notice("Copied " + label + " report to clipboard.")).catch(() => fallback(md));
    } else {
      fallback(md);
    }
  };
  toolbar.appendChild(copy);

  root.appendChild(toolbar);

  const title = document.createElement("div");
  title.style.fontSize = "18px";
  title.style.fontWeight = "750";
  title.textContent = "🗓️ " + label;
  root.appendChild(title);

  // charts (experiment)
  const hc = document.createElement("h3");
  hc.className = "rh";
  hc.textContent = "📈 Charts";
  root.appendChild(hc);
  renderCharts(d);

  const pct = (done, all) => (all > 0 ? Math.round((done / all) * 100) : 0);

  const cards = document.createElement("div");
  cards.className = "cards";
  const kpis = [
    ["DAYS LOGGED", periodPages.length, "active days"],
    ["WORK ITEMS", work.length, "recorded in period"],
    ["TASKS COMPLETED", doneTasks.length, `${allTasks} total · ${pct(doneTasks.length, allTasks)}%`],
    ["LESSONS", lessons.length, "captured in period"],
    ["BUGS FIXED", bugs.length, "written in period"]
  ];
  cards.innerHTML = kpis.map(([lbl, val, sub]) => `
    <div class="card"><div class="lbl">${lbl}</div><div class="val">${val}</div>
    <div class="lbl" style="margin-top:4px">${sub}</div></div>`).join("");
  root.appendChild(cards);

  // Highlights
  const h0 = document.createElement("h3");
  h0.className = "rh";
  h0.textContent = "💡 Highlights";
  root.appendChild(h0);

  if (impacts.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No highlights yet — add a **Impact:** line to a daily note's End-of-Day Summary to collect highlights here.";
    root.appendChild(e);
  } else {
    for (const im of impacts.slice(0, 12)) {
      root.appendChild(icon(`✨ ${im.date} — ${im.text}`, im.link));
    }
  }

  renderWorkSection(work);
  renderWinsSection(wonTasks, winLines);

  // hint
  const hint = document.createElement("div");
  hint.className = "empty";
  hint.style.marginTop = "16px";
  hint.textContent = "Tip: every row opens its daily note. Work comes from Today sections; wins come from completed Wins entries or #win tasks. Use ◀ Prev / Next ▶ to move between periods.";
  root.appendChild(hint);
}

function buildMarkdown(label, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs) {
  const lines = [];
  lines.push(`# 📊 ${label} — Report`);
  lines.push("");
  lines.push(`> Generated ${new window.moment().format("dddd, MMMM D, YYYY h:mm A")}`);
  lines.push("");
  const pct = (d, a) => (a > 0 ? Math.round((d / a) * 100) : 0);
  const doneCount = work.filter(w => w.task && w.done).length;
  const taskTotal = work.filter(w => w.task).length;
  lines.push("## 📌 Highlights");
  if (impacts.length) lines.push(...impacts.slice(0, 12).map(im => `- ✨ [[${im.link.path}|${im.date} — ${im.text}]]`));
  else lines.push("- ");
  lines.push("");
  lines.push("## 🚀 Wins");
  const wins = collectWins(wonTasks, winLines).map(w => `- ✅ [[${w.link.path}|${w.date} — ${w.text}]]`);
  if (wins.length) lines.push(...wins.slice(0, 40));
  else lines.push("- ");
  lines.push("");
  lines.push(`## 💪 What I Worked On  (${periodPages.length} days · ${work.length} items · ${doneCount}/${taskTotal} tasks done, ${pct(doneCount, taskTotal)}%)`);
  for (const [ticket, items] of groupWorkItems(work)) {
    lines.push(ticket === "General" ? "### 🗂 General" : `### 🔖 #${ticket}`);
    for (const w of items) {
      lines.push((w.task ? (w.done ? "- ✅ " : "- ☐ ") : "- · ") + `[[${w.link.path}|${w.date} — ${w.text}]]`);
    }
  }
  if (!work.length) lines.push("- ");
  lines.push("");
  lines.push("## 🔄 In Progress / 🔜 Next");
  lines.push("- ");
  lines.push("");
  lines.push("## ⚠️ Risks / Blockers");
  lines.push("- ");
  lines.push("");
  return lines.join("\n");
}

render();
```

> **What's in the beta now:** the real hub's wins rules and Copy-as-Markdown, a progress-led **What I Worked On** view grouped by work item, a dated **Wins** timeline, a **Tracker** activity calendar, and a **Charts** section (work-items line, done-vs-open bars, work-mix doughnut). Everything themes itself to your active Obsidian theme.
>
> Restart Obsidian once so the **Charts** and **Tracker** plugins register, then open this note. Future experiments stay in this file until we agree, then I promote it.