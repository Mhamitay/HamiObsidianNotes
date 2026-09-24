---
title: FieldPro Command Center
type: dashboard
---
# 🔗 QUICK NAVIGATION

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- |
| 🏠 Dashboard       | [[00 FieldPro_Command_Center_v3]]                           |
| 📊 Reports        | [[02 Reports Hub]]                                          |
| 🎯 Current Sprint  | [[02 Sprints/Current Sprint/00 2026/01 Maintenance Part 1]] |
| 📅 Daily Notes     | [[002 Dev Cabinet/00 Daily Notes]]                           |
| 📊 Weekly Reports  | [[002 Dev Cabinet/01 Weekly Reports]]                        |
| 📆 Monthly Reviews | [[002 Dev Cabinet/02 Monthly Reviews]]                       |
| 🐛 Bugs Fixed      | [[04 Lessons Learned/Bugs Fixed]]                           |
| 💡 Lessons Learned | [[04 Lessons Learned]]                                      |
| 💬 PR Comments     | [[05 Communication/PR Comments]]                            |
| 🔧 Snippets        | [[06 Snippets]]                                             |
| 📖 Reference       | [[07 Reference/Cheat Sheets]]                               |
| 🛠️ How To         | [[04 Lessons Learned/How To]]                                               |
| 🧰 Useful Scripts  | [[Useful Scripts]]                                          |
# 🎯 Habits

```habits
```

# 🏠 Field Pro Command Center

[[02 Sprints/Current Sprint/00 2026/01 Maintenance Part 1]]

## 🧠 Remember

> Things I want to keep visible every day.

```dataview
LIST WITHOUT ID
  item.text
FROM ""
FLATTEN file.lists AS item
WHERE contains(item.text, "#remember")
SORT file.mtime DESC
```


## 📈 RECENT ACTIVITY

```dataview
TABLE WITHOUT ID
  file.link AS "Note",
  file.mtime AS "Last Updated"
FROM "02 Work/FieldPro"
WHERE !contains(file.path, ".obsidian")
SORT file.mtime DESC
LIMIT 15
```
## 📊 ENGINEERING METRICS

```dataviewjs
// ============================================================
// ENGINEERING METRICS - KPI cards (week / month)
// Read completed tasks from the "Today" sections of daily notes.
// ============================================================
const DAILY_NOTES = "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes";

if (!document.getElementById("eng-metrics-style")) {
    const style = document.createElement("style");
    style.id = "eng-metrics-style";
    style.textContent = `
.eng-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 12px 0; }
.eng-metric-card { padding: 14px 16px; border-radius: 12px; border: 1px solid var(--background-modifier-border); background: var(--background-secondary); }
.eng-metric-label { color: var(--text-muted); font-size: 11px; font-weight: 700; letter-spacing: .05em; }
.eng-metric-value { margin-top: 4px; font-size: 24px; font-weight: 800; line-height: 1.1; }
.eng-metric-sub { margin-top: 3px; color: var(--text-muted); font-size: 11px; }
`;
    document.head.appendChild(style);
}

const pages = dv.pages(`"${DAILY_NOTES}"`)
    .where(p => p && p.file && p.file.name && /^\d{4}-\d{2}-\d{2}$/.test(p.file.name))
    .array();

const dateOf = p => window.moment(p.file.name, "YYYY-MM-DD", true).startOf("day");
const daily = pages.filter(p => dateOf(p).isValid());

const today = window.moment().startOf("day");
const weekStart = window.moment(today).subtract(6, "days").startOf("day");
const monthStart = window.moment(today).startOf("month");

const todayItems = p =>
    (p.file.lists || [])
        .filter(i => i && i.section && i.section.subpath && i.section.subpath.trim().endsWith("Today"));

const inRange = (p, from) => {
    const d = dateOf(p);
    return d.valueOf() >= from.valueOf() && d.valueOf() <= today.valueOf();
};

const weekPages = daily.filter(p => inRange(p, weekStart));
const monthPages = daily.filter(p => inRange(p, monthStart));

const weekTasks  = weekPages .flatMap(todayItems).filter(i => i.task);
const monthTasks = monthPages.flatMap(todayItems).filter(i => i.task);

const weekDone  = weekTasks .filter(i => i.completed).length;
const monthDone = monthTasks.filter(i => i.completed).length;

const pct = (done, all) => (all > 0 ? Math.round((done / all) * 100) : 0);

const root = dv.el("div", "");
root.className = "eng-metrics";

const card = (label, value, sub) => `
    <div class="eng-metric-card">
        <div class="eng-metric-label">${label}</div>
        <div class="eng-metric-value">${value}</div>
        <div class="eng-metric-sub">${sub}</div>
    </div>
`;

root.innerHTML = [
    card("7-DAY COMPLETED", weekDone,  `${weekTasks.length} tasks · ${weekPages.length} days logged`),
    card("THIS MONTH COMPLETED", monthDone, `${monthTasks.length} tasks · ${monthPages.length} active days`),
    card("7-DAY COMPLETION", `${pct(weekDone, weekTasks.length)}%`, `${weekDone} / ${weekTasks.length}`),
    card("MONTH COMPLETION", `${pct(monthDone, monthTasks.length)}%`, `${monthDone} / ${monthTasks.length}`)
].join("");
```

## ⚡ TODAY

### 📅 Today's Daily Note

```dataview
LIST WITHOUT ID
  file.link
FROM "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes"
WHERE file.name = dateformat(date(today), "yyyy-MM-dd")
LIMIT 1
```

### 🎯 Today's Tasks

```tasks
not done
path includes 02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes
filename includes 2026-09-12
sort by priority
sort by due
```

### 🔄 Carried Over 
```dataview
TASK
FROM "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes"
WHERE !completed
AND file.name != dateformat(date(today), "yyyy-MM-dd")
SORT priority ASC
SORT due ASC
```
## 🚧 Blockers
```dataview
LIST WITHOUT ID
  item.text
FROM "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes"
FLATTEN file.lists AS item
WHERE contains(item.tags, "#blocker")
  AND !item.completed
SORT file.day DESC
```

## 🐛 ISSUES & LEARNING

### 🐛 Recent Bug Fixes

```dataview
TABLE WITHOUT ID
  file.link AS "Bug / Fix",
  file.mtime AS "Updated"
FROM "02 Work/FieldPro/04 Lessons Learned/Bugs Fixed"
SORT file.mtime DESC
LIMIT 8
```

### 💡 Recent Lessons
```dataview
LIST
FROM "02 Work/FieldPro/04 Lessons Learned"
SORT file.mtime DESC
LIMIT 8
```

### 🧠 How To
```dataview
TABLE WITHOUT ID
  file.link AS "Bug / Fix",
  file.mtime AS "Updated"
FROM "02 Work/FieldPro/04 Lessons Learned/How To"
SORT file.mtime DESC
LIMIT 8
```
```dataview
LIST
FROM "02 Work/FieldPro/04 Lessons Learned/Things I Dont Want to Forget"
SORT file.mtime DESC
LIMIT 8
```

---
## 🧭 KNOWLEDGE

### Engineering Knowledge Areas

| Area             | Open                |
| ---------------- | ------------------- |
| 🏗️ Architecture | [[00 Knowledge Base/01 - Architecture]] |
| 📦 Applications  | [[00 Knowledge Base/02 - Applications]] |
| 💻 Backend       | [[00 Knowledge Base/03 - Backend]]      |
| 🎨 Frontend      | [[00 Knowledge Base/04 - Frontend]]     |
| 🗄️ Database     | [[00 Knowledge Base/05 - Database]]     |

> These links assume the engineering knowledge-base notes/folders are available inside this vault. If those areas remain in a separate Obsidian vault, keep them as a separate knowledge vault rather than creating broken links here.

### FieldPro Knowledge

- [[04 Lessons Learned]]
- [[04 Lessons Learned/Bugs Fixed]]
- [[04 Lessons Learned/Performance]]
- [[04 Lessons Learned/Things I Dont Want to Forget]]
- [[07 Reference/Cheat Sheets]]
- [[04 Lessons Learned/How To]]
- [[06 Snippets]]

---


## 📌 ENGINEERING SYSTEM

**Daily →** capture what happened  
**Sprint →** execute current work  
**Lessons →** promote discoveries  
**Knowledge →** keep durable engineering knowledge  
**Weekly / Monthly →** review and improve

> **Dashboard rule:** the dashboard is for seeing and navigating.  
> **Daily notes are for capturing.**  
> **Knowledge notes are for keeping.**  
> **Sprint notes are for executing.**




## 📌 Engineering Habits

- 🌅 Fill in the daily note every morning — **Yesterday / Today / Blockers** — before checking Slack.
- 🔍 Log any bug fix that takes **more than 30 minutes** to root-cause.
- 💡 Capture important lessons instead of relying on memory.
- 💬 Save valuable PR review comments and communication examples.
- 🧠 Add `# remember` to anything I need to see regularly.
- 🗂️ Keep daily notes as the raw record; promote valuable information into the Knowledge Base.

---
## 📌 Tags

- `# remember` — Something I want to keep visible.
- `#bug` — Bug-related information.
- `#lesson` — Lesson learned.
- `#architecture` — Architecture/design decisions.
- `#performance` — Performance-related information.
- `#reference` — Useful reference material.
# ⚙️ PLUGIN POWER

This dashboard is designed to take advantage of the plugins already installed in this vault:

**Dataview** → dynamic tables and lists  
**Tasks** → live task management  
**Templater** → note automation  
**QuickAdd** → fast capture/actions  
**Calendar** → date navigation  
**Habits** → habit tracking  
**Rollover Daily Todos** → carry-forward tasks  
**Dashboard Hub / DataDeck** → dashboard enhancements  
**Progressbar** → visual progress  
**Note Metrics** → note/activity insights  
**Omnisearch** → fast knowledge retrieval  
**Excalidraw** → architecture diagrams and visual thinking