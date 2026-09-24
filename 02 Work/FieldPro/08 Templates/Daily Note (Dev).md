---
tags:
  - daily
  - dev-log
date: {{date}}
day: "{{date:dddd}}"
mood:
energy:
sprint:
---

# 📅 {{date:YYYY-MM-DD dddd}}

> [!quote] **Daily Dev Log** — *plan → execute → capture → review.*

## 🌅 Kick-off

### 🎯 Top 3 (Most Important Tasks)

> Limit to 3 — everything else goes to the backlog below.

- [ ] 1️⃣
- [ ] 2️⃣
- [ ] 3️⃣
- [ ]

### ⏱️ Time-Boxed Plan

> Block time for deep work. Be realistic.

| Time | Block | Notes |
| ---- | ----- | ----- |
| 09:00 – 10:30 | Deep work |  |
| 10:30 – 10:45 | Break |  |
| 10:45 – 12:30 | Deep work |  |
| 12:30 – 13:30 | Lunch |  |
| 13:30 – 15:00 | Meeting / reviews |  |
| 15:00 – 16:30 | Deep work |  |
| 16:30 – 17:00 | Wrap-up & plan tomorrow |  |

### 🍅 Pomodoro Log

> Spin up the Pomodoro plugin and log focus rounds here.

| # | Task | 🍅 | Notes |
| - | ---- | -- | ----- |
| 1 |  |  |  |
| 2 |  |  |  |

---

## 🧠 Context

### 🔄 Carried Over
```dataview
TASK
FROM "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes"
WHERE !completed
AND file.name != dateformat(date(today), "yyyy-MM-dd")
SORT priority ASC
SORT due ASC
```

### 📝 Yesterday

```dataviewjs
const currentDate = dv.current().file.name;
const yesterday = window.moment(currentDate, "YYYY-MM-DD", true)
    .subtract(1, "day")
    .format("YYYY-MM-DD");

const page = dv.pages("")
    .find(p => p.file.name === yesterday);

if (page) {
    const items = page.file.lists
        .filter(item => item.section?.subpath?.trim().endsWith("Today"));
    dv.list(items.map(item => item.text));
} else {
    dv.paragraph(`No daily note found for ${yesterday}.`);
}
```

### 📌 Backlog (other priorities)

> Tasks for today that are not MITs. Use ⏫ 🔼 🔽 for priority.

- [ ] 
- [ ] 

---

## ☀️ During the Day

### 💻 Work Log

> Time-stamped running log of what you actually did.

- **HH:mm** — 

### 📦 Work Items

> Tickets, PRs, bugs, and investigations you're touching today.

- **[[#]]** — status / next step

### 🔎 Code Reviews

| PR / Branch | Result | Notes |
| ----------- | ------ | ----- |
|  | ✅ / ❌ / 🟡 |  |

### 🤝 Meetings

> Name · who · outcome · action items

- **Meeting** — notes → action: 

### 🚧 Blockers

> Anything slowing you down. Be specific.

- None

---

## 🌙 Wrap-up

### 💡 Insights & Lessons Learned

> Capture discoveries here first. Promote durable knowledge to `04 Lessons Learned`.

- 

### 📝 Notes

- 

### 📊 End-of-Day Review

**Day status:** 🟢 / 🟡 / 🔴

**Energy:** 1 🔵 2 🔵 3 🟢 4 🟢 5 🟢
**Focus:** 1 🔵 2 🔵 3 🟢 4 🟢 5 🟢

#### ✅ Completed today

- 

#### 🚧 Still in progress

- 

#### ⛔ Blockers

- None

#### 🔮 Tomorrow (MITs)

- [ ] 1️⃣
- [ ] 2️⃣
- [ ] 3️⃣

### 💬 Standup-ready snippet

> Copy → paste into Standup. Fill from the sections above.

**Yesterday:** 
**Today:** 
**Blockers:** None

---

## 🔗 Related

**Sprint:**  
- 

**PR / Ticket:**  
- 

**Useful notes:**  
-