---
title: Reports Hub
type: dashboard
---

# 📊 Reports Hub

> Auto-generated report from daily notes — shows what you worked on and your wins.
> Pick a period, then **Copy as Markdown** to save it as a weekly/monthly/yearly report note.

```dataviewjs
// =====================================================================
// REPORTS HUB — aggregates daily notes into a weekly/monthly/yearly report
// =====================================================================
const DAILY_NOTES = "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes";
const BUGS_FOLDER = "02 Work/FieldPro/04 Lessons Learned/Bugs Fixed";
const WIN_TAG = "#win";

const state = (window.__reportsState = window.__reportsState || { period: "week", offset: 0 });

// ---------- styling ----------
if (!document.getElementById("reports-hub-style")) {
  const s = document.createElement("style");
  s.id = "reports-hub-style";
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
  if (state.period === "all") {
    start = daily.length ? dateOf(daily[0]).clone() : today.clone();
    end = today.clone().add(1, "day");
    label = "All Time";
  } else if (state.period === "week") {
    start = today.clone().add(state.offset, "weeks").startOf("isoWeek");
    end = start.clone().add(1, "week");
    label = start.format("MMM D") + " – " + end.clone().subtract(1, "day").format("MMM D, YYYY");
  } else if (state.period === "month") {
    start = today.clone().add(state.offset, "months").startOf("month");
    end = start.clone().add(1, "month");
    label = start.format("MMMM YYYY");
  } else {
    start = today.clone().add(state.offset, "years").startOf("year");
    end = start.clone().add(1, "year");
    label = start.format("YYYY");
  }
  return { start, end, label };
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
  const { start, end } = rangeFor();
  const periodPages = daily.filter(p => inPeriod(start, end, p));

  const work = [];
  const doneTasks = [];
  const wonTasks = [];
  const winLines = [];
  const lessons = [];
  const impacts = [];
  let allTasks = 0;

  for (const p of periodPages) {
    const dstr = dateOf(p).format("ddd, MMM D");
    const seen = new Set();

    for (const i of allItems(p)) {
      if (i.task) {
        allTasks++;
        if (i.completed) {
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
        if (i.text.includes(WIN_TAG)) {
          winLines.push({ date: dstr, text: i.text, link: p.file.link });
        }
      }
    }

    for (const i of sectionItems(p)) {
      const text = cleanText(i);
      if (text) work.push({ date: dstr, text, ticket: workItemOf(text), task: i.task, done: i.completed, link: p.file.link });
    }
  }

  const bugs = dv.pages(`"${BUGS_FOLDER}"`).array().filter(b => {
    const m = window.moment(b.file.mtime);
    return m.valueOf() >= start.valueOf() && m.valueOf() < end.valueOf();
  }).map(b => ({ date: window.moment(b.file.mtime).format("MMM D"), link: b.file.link }));

  return { start, end, periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs, allTasks };
}

// ---------- render ----------
const root = dv.el("div", "", { cls: "reports-hub" });

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function icon(t, b) {
  const el = document.createElement("div");
  el.className = "row";
  if (b && b.path) {
    el.classList.add("link");
    el.title = "Open note → " + b.path;
    el.onclick = (e) => {
      e.preventDefault();
      app.workspace.openLinkText(b.path, "", true);
    };
    el.innerHTML = `${t} <span class="src">${esc(b.path)}</span> <span class="go">↗</span>`;
  } else {
    el.innerHTML = t;
  }
  return el;
}

function render() {
  root.replaceChildren();
  const { start, end, label } = rangeFor();
  const { periodPages, work, doneTasks, wonTasks, winLines, lessons, impacts, bugs, allTasks } = collect();

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

  // Highlights (from daily **Impact:** lines)
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

  // Wins
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

  // nagitation hint
  const hint = document.createElement("div");
  hint.className = "empty";
  hint.style.marginTop = "16px";
  hint.textContent = "Tip: only explicit wins show here — a completed task tagged #win or under a 'Wins' heading, or a #win line. Tag an item #win in a daily note to surface it. Use ◀ ▶ to move between periods.";
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

> **How to use:** 1) Pick `Week` / `Month` / `Year` / `All Time`. 2) Use `◀ Prev / Next ▶` to move between periods. 3) Click **📋 Copy as Markdown** and paste into a weekly/monthly/yearly report note (templates in `08 Templates`).
>
> **What counts as a "win":** completed tasks tagged `#win` or under a *Wins* heading, plus non-task lines tagged `#win`. Click any win to open its source note and fix a mis-click. (Lessons and bug-fix notes are NOT wins unless explicitly tagged.)