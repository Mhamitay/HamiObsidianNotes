---
tags: [yearly-review]
period: {{date:YYYY}}
---

# 🗓️ Yearly Review

## 🏆 Year Highlights
-

## 🚀 Wins
> Anything extra beyond what's auto-collected below
-

## 🚧 Challenges
-

## 📚 Skills Growth
-

## 🎯 Goals for Next Year
-

---

## 📊 Auto-collected from daily notes

> Pulls completed tasks, work items, lessons, and #win lines from your daily notes for this year.

```dataviewjs
const DAILY_NOTES = "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes";
const WIN_TAG = "#win";
const cur = dv.current();
const today = window.moment().startOf("day");

let start, end, label;
const period = (cur.period || "").trim();
let m;
if ((m = period.match(/^(\d{4})-W(\d{2})$/))) {
  start = window.moment().isoWeekYear(+m[1]).isoWeek(+m[2]).startOf("isoWeek");
  end = start.clone().add(1, "week");
  label = start.format("MMM D") + " – " + end.clone().subtract(1, "day").format("MMM D, YYYY");
} else if ((m = period.match(/^(\d{4})-(\d{2})$/))) {
  start = window.moment({ y: +m[1], M: +m[2] - 1 }).startOf("month");
  end = start.clone().add(1, "month");
  label = start.format("MMMM YYYY");
} else if ((m = period.match(/^(\d{4})$/))) {
  start = window.moment({ y: +m[1] }).startOf("year");
  end = start.clone().add(1, "year");
  label = m[1];
} else {
  start = today.clone().startOf("year");
  end = start.clone().add(1, "year");
  label = start.format("YYYY");
}

const pages = dv.pages(`"${DAILY_NOTES}"`)
  .where(p => p.file.name && /^\d{4}-\d{2}-\d{2}$/.test(p.file.name)).array();
const dateOf = p => window.moment(p.file.name, "YYYY-MM-DD", true).startOf("day");
const allItems = p => p.file.lists || [];
const secOf = i => (i.section?.subpath || "").trim().toLowerCase();
const isWinTask = i => (i.text || "").toLowerCase().includes(WIN_TAG) || /\bwins?\b/i.test(secOf(i)) || secOf(i).includes("🏆");
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

const inP = p => { const d = dateOf(p); return d.valueOf() >= start.valueOf() && d.valueOf() < end.valueOf(); };
const periodPages = pages.filter(inP).sort((a, b) => dateOf(a).valueOf() - dateOf(b).valueOf());

const wins = [];
const work = [];
const impacts = [];
for (const p of periodPages) {
  const dstr = dateOf(p).format("MMM D");
  for (const i of allItems(p)) {
    if (!i) continue;
    const sec = secOf(i);
    if (i.task) {
      if (i.completed && isWinTask(i)) {
        const t = cleanText(i);
        if (t) wins.push({ d: dstr, t, l: p.file.link });
      }
      if (sec.endsWith("today")) {
        const t = cleanText(i);
        if (t) work.push({ d: dstr, t, ticket: workItemOf(t), l: p.file.link });
      }
    } else if (i.text && i.text.includes(WIN_TAG)) {
      wins.push({ d: dstr, t: i.text.replace(WIN_TAG, "").replace(/[\s]+$/g, ""), l: p.file.link });
    } else if (/impact/i.test(sec) && i.text && i.text.trim()) {
      impacts.push({ d: dstr, t: i.text.trim(), l: p.file.link });
    }
  }
}

const months = periodPages.reduce((acc, p) => {
  const k = dateOf(p).format("MMM YYYY");
  acc[k] = (acc[k] || 0) + 1;
  return acc;
}, {});

dv.paragraph(`**Collected period:** ${label} · ${periodPages.length} active days`);

if (Object.keys(months).length) {
  dv.header(3, "🗓️ Activity by Month");
  const total = periodPages.length;
  for (const [k, v] of Object.entries(months)) {
    const bar = "█".repeat(Math.max(1, Math.round((v / Math.max(...Object.values(months))) * 20)));
    dv.listItem(`${k} · ${v} day${v === 1 ? "" : "s"} ${bar}`);
  }
}

if (impacts.length) {
  dv.header(3, "💡 Highlights");
  for (const im of impacts.slice(0, 30)) dv.listItem(`✨ **${im.d}** — ${im.t} <br><small>${im.l}</small>`);
}

if (wins.length) {
  dv.header(3, "🏆 Wins");
  for (const w of wins.slice(0, 100)) dv.listItem(`**${w.d}** — ${w.t} <br><small>${w.l}</small>`);
}

if (work.length) {
  dv.header(3, "💪 What I Worked On");
  const groups = new Map();
  for (const w of work) {
    const key = w.ticket || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  for (const [ticket, items] of groups) {
    dv.header(4, ticket === "General" ? "🗂 General" : `🔖 #${ticket}`);
    for (const w of items.slice(0, 40)) dv.listItem(`**${w.d}** — ${w.t} <br><small>${w.l}</small>`);
  }
}

if (!wins.length && !work.length && !impacts.length) {
  dv.paragraph("_No daily notes recorded for this period._");
}
```