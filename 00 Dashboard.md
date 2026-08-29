# 🏠 FieldPro Vault

> **Your engineering command center**>
> One place for today's habits, priorities, active work, tasks, reminders, and knowledge.

## 📅 Today


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

## 📊 Habit Overview

```habits
```

```habits-table
```

## ✅ Open Tasks

```tasks
not done
path includes Work
sort by priority
sort by due
```


## 🎯 Current Focus

### 🚨 Priorities

- [[Current Priorities]]

### 🐛 Open Bugs

- [[Open Bugs]]

### 🚀 Active Work

```dataview
TABLE WITHOUT ID
  file.link AS "Work Item",
  status AS "Status",
  priority AS "Priority"
FROM "Work"
WHERE status = "Active"
SORT priority ASC
```

---

## 🔄 Recent Activity

```dataview
TABLE WITHOUT ID
  file.link AS "Note",
  file.mtime AS "Last Updated"
FROM ""
WHERE file.name != this.file.name
SORT file.mtime DESC
LIMIT 10
```

---

## 💡 Recently Learned

```dataview
LIST
FROM "04 Lessons Learned"
SORT file.mtime DESC
LIMIT 5
```

---

## 📥 Capture / Inbox

> Temporary information that needs to be organized later.

- [ ] 

---

## 🗺️ Knowledge Base

### 💻 Engineering

- [[03 Knowledge Base/C#]]
- [[03 Knowledge Base/SQL Server]]
- [[03 Knowledge Base/Azure]]
- [[03 Knowledge Base/Git]]
- [[03 Knowledge Base/Entity Framework]]

### 🏗️ Architecture

- [[03 Knowledge Base/Architecture]]
- [[03 Knowledge Base/Design Patterns]]

### 🏢 Domain

- [[03 Knowledge Base/FieldPro Domain]]

---

## 📚 Work Areas

- 🎯 [[Current Priorities]]
- 🐛 [[Open Bugs]]
- 🏃 [[Sprint]]
- 📅 [[Daily Notes]]
- 📊 [[Weekly Reports]]
- 📆 [[Monthly Reports]]
- 💡 [[04 Lessons Learned]]
- 💬 [[05 Communication/PR Comments]]
- 🔧 [[05 Snippets]]
- 📖 [[References]]
- 🛠️ [[How To]]

---

## 🧭 Quick Navigation

| Area | Link |
|---|---|
| 🏠 Dashboard | [[FieldPro Vault]] |
| 🎯 Priorities | [[Current Priorities]] |
| 🐛 Open Bugs | [[Open Bugs]] |
| 🏃 Current Sprint | [[Sprint]] |
| 📅 Daily Notes | [[Daily Notes]] |
| 📚 Lessons Learned | [[04 Lessons Learned]] |
| 💬 Communication / PRs | [[05 Communication/PR Comments]] |
| 🔧 Snippets | [[05 Snippets]] |
| 📖 References | [[References]] |
| 🛠️ How To | [[How To]] |

---

## 📌 Engineering Habits

- 🌅 Fill in the daily note every morning — **Yesterday / Today / Blockers** — before checking Slack.
- 🔍 Log any bug fix that takes **more than 30 minutes** to root-cause.
- 💡 Capture important lessons instead of relying on memory.
- 💬 Save valuable PR review comments and communication examples.
- 🧠 Add `#remember` to anything I need to see regularly.
- 🗂️ Keep daily notes as the raw record; promote valuable information into the Knowledge Base.

---
## 📌 Tags

- `#remember` — Something I want to keep visible.
- `#bug` — Bug-related information.
- `#lesson` — Lesson learned.
- `#architecture` — Architecture/design decisions.
- `#performance` — Performance-related information.
- `#reference` — Useful reference material.

[#fieldpro](#fieldpro)