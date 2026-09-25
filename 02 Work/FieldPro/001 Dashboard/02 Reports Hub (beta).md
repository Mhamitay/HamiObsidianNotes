---
title: Reports Hub (beta)
type: dashboard
---

# 🧪 Reports Hub (beta)

> **Sandbox — experiment file.** All aggregation, wins rules, and Copy-as-Markdown are identical to the real hub. Two things are new: the **📈 Charts** section (free *Charts* plugin — Chart.js) and the **📅 Activity Calendar** (free *Tracker* plugin — month views). Both are installed; restart Obsidian once to load them, then open this note.

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
.reports-hub .btn.active{background:var(--interactive-accent);color:var(--text-on-accent);border-color:transparent;}
.reports-hub .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:12px 0;}
.reports-hub .card{padding:12px 14px;border-radius:10px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);}
.reports-hub .card .lbl{color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:.05em;}
.reports-hub .card .val{font-size:22px;font-weight:800;}
.reports-hub h3.rh{font-size:16px;margin:22px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--background-modifier-border);}
.reports-hub .empty{color:var(--text-muted);font-style:italic;padding:4px 0;}
.reports-hub .row{font-size:14px;line-height:1.5;padding:2px 0;}
.reports-hub .src{color:var(--text-muted);font-size:12px;}
.reports-hub .row.link{cursor:pointer;border-radius:6px;padding:3px 6px;margin:0 -6px;}
.reports-hub .row.link:hover{background:var(--background-modifier-hover);}
.reports-hub .row.link .go{color:var(--text-accent);font-size:12px;}
.reports-hub .row.link:hover .src{color:var(--text-normal);text-decoration:underline;}
.reports-hub .note-ref{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;}
.reports-hub .charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;margin:12px 0;}
.reports-hub .chbox{padding:12px 14px;border-radius:10px;border:1px solid var(--background-modifier-border);background:var(--background-secondary);}
.reports-hub .chbox .cht{color:var(--text-muted);font-size:10px;font-weight:700;letter-spacing:.05em;margin-bottom:6px;}
.reports-hub .chbox .ch{position:relative;height:210px;}
.reports-hub .nocharts{padding:10px 12px;margin:12px 0;border:1px dashed var(--background-modifier-border);border-radius:10px;color:var(--text-muted);font-size:13px;}
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

const sectionItems = p =>
  (p.file.lists || []).filter(i => i && i.section && i.section.subpath && i.section.subpath.trim().endsWith("Today"));
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
              doneTasks.push({ date: dstr, text, link: p.file.link });
              if (isWinTask(i)) wonTasks.push({ date: dstr, text, link: p.file.link });
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
          winLines.push({ date: dstr, text: i.text, link: p.file.link });
        }
      }
    }

    for (const i of sectionItems(p)) {
      const text = cleanText(i);
      if (text) {
        rec.items++;
        work.push({ date: dstr, text, ticket: workItemOf(text), task: i.task, done: i.completed, link: p.file.link });
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

  // What I Worked On
  const h1 = document.createElement("h3");
  h1.className = "rh";
  h1.textContent = "💪 What I Worked On";
  root.appendChild(h1);

  if (work.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No work items recorded in this period.";
    root.appendChild(e);
  } else {
    const groups = new Map();
    for (const w of work) {
      const key = w.ticket || "General";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(w);
    }
    for (const [ticket, items] of groups) {
      const g = document.createElement("div");
      g.style.fontWeight = "700";
      g.style.fontSize = "13px";
      g.style.margin = "10px 0 2px";
      g.style.opacity = ".9";
      g.textContent = ticket === "General" ? "🗂 General" : "🔖 #" + ticket + (items.length > 1 ? ` · ${items.length} items` : "");
      root.appendChild(g);
      for (const w of items) {
        const mark = w.task ? (w.done ? "✅ " : "☐ ") : "· ";
        root.appendChild(icon(`${w.date} — ${mark}${w.text}`, w.link));
      }
    }
  }

  // Wins (unchanged — restored style)
  const h2 = document.createElement("h3");
  h2.className = "rh";
  h2.textContent = "🏆 Wins";
  root.appendChild(h2);

  const allWins = [
    ...wonTasks.map(w => ({ date: w.date, text: "✅ " + w.text, link: w.link })),
    ...winLines.map(w => ({ date: w.date, text: w.text.replace(WIN_TAG, "").trim(), link: w.link }))
  ];

  if (allWins.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No wins recorded in this period. Tag a completed task with #win or put it under a 'Wins' heading in a daily note to collect it here.";
    root.appendChild(e);
  } else {
    for (const w of allWins.slice(0, 60)) {
      root.appendChild(icon(`🏆 ${w.date} — ${w.text}`, w.link));
    }
  }

  // hint
  const hint = document.createElement("div");
  hint.className = "empty";
  hint.style.marginTop = "16px";
  hint.textContent = "Tip: only explicit wins show here — a completed task tagged #win or under a 'Wins' heading, or a #win line. The Charts section is the experiment: activity line, done-vs-open bars, and the work mix doughnut. Tell me what to change.";
  root.appendChild(hint);
}

function buildMarkdown(label, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs) {
  const lines = [];
  lines.push(`# 📊 ${label} — Report`);
  lines.push("");
  lines.push(`> Generated ${new window.moment().format("dddd, MMMM D, YYYY h:mm A")}`);
  lines.push("");
  const pct = (d, a) => (a > 0 ? Math.round((d / a) * 100) : 0);
  const doneCount = doneTasks.length;
  const taskTotal = work.filter(w => w.task).length;
  lines.push("## 📌 Highlights");
  if (impacts.length) lines.push(...impacts.slice(0, 12).map(im => `- ✨ [[${im.link.path}|${im.date} — ${im.text}]]`));
  else lines.push("- ");
  lines.push("");
  lines.push("## 🚀 Wins");
  const wins = [
    ...wonTasks.map(w => `- ✅ [[${w.link.path}|${w.date} — ${w.text}]]`),
    ...winLines.map(w => `- [[${w.link.path}|${w.date} — ${w.text}]]`)
  ];
  if (wins.length) lines.push(...wins.slice(0, 40));
  else lines.push("- ");
  lines.push("");
  lines.push(`## 💪 What I Worked On  (${periodPages.length} days · ${work.length} items · ${doneCount}/${taskTotal} tasks done, ${pct(doneCount, taskTotal)}%)`);
  const groups = new Map();
  for (const w of work) {
    const key = w.ticket || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  for (const [ticket, items] of groups) {
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

> **What's in the beta now:** the exact old hub (wins list, cards, group-by-ticket, Copy-as-Markdown) plus a **Tracker** activity calendar (wins + days logged month views) and a **Charts** section (work-items line, done-vs-open bars, work-mix doughnut). Everything themes itself to your active Obsidian theme.
>
> Restart Obsidian once so the **Charts** and **Tracker** plugins register, then open this note. Future experiments stay in this file until we agree, then I promote it.