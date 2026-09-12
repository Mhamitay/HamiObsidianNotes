---
title: FieldPro Command Center
type: dashboard
---
# 🔗 QUICK NAVIGATION

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- |
| 🏠 Dashboard       | [[00 FieldPro_Command_Center_v3]]                           |
| 🎯 Current Sprint  | [[02 Sprints/Current Sprint/00 2026/01 Maintenance Part 1]] |
| 📅 Daily Notes     | [[01 Dev Cabinet/00 Daily Notes]]                           |
| 📊 Weekly Reports  | [[01 Dev Cabinet/01 Weekly Reports]]                        |
| 📆 Monthly Reviews | [[01 Dev Cabinet/02 Monthly Reviews]]                       |
| 🐛 Bugs Fixed      | [[04 Lessons Learned/Bugs Fixed]]                           |
| 💡 Lessons Learned | [[04 Lessons Learned]]                                      |
| 💬 PR Comments     | [[05 Communication/PR Comments]]                            |
| 🔧 Snippets        | [[06 Snippets]]                                             |
| 📖 Reference       | [[07 Reference/Cheat Sheets]]                               |
| 🛠️ How To         | [[09 How To]]                                               |
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
FROM "Work/FieldPro"
WHERE !contains(file.path, ".obsidian")
SORT file.mtime DESC
LIMIT 15
```
## ⚡ TODAY

### 📅 Today's Daily Note

```dataview
LIST WITHOUT ID
  file.link
FROM "Work/FieldPro/01 Dev Cabinet/00 Daily Notes"
WHERE file.name = dateformat(date(today), "yyyy-MM-dd")
LIMIT 1
```

### 🎯 Today's Tasks

```tasks
not done
path includes Work/FieldPro/01 Dev Cabinet/00 Daily Notes
filename includes 2026-09-12
sort by priority
sort by due
```

### 🔄 Carried Over 
```dataview
TASK
FROM "Work/FieldPro/01 Dev Cabinet/00 Daily Notes"
WHERE !completed
AND file.name != dateformat(date(today), "yyyy-MM-dd")
SORT priority ASC
SORT due ASC
```
## 🚧 Blockers
```dataview
LIST WITHOUT ID
  item.text
FROM "Work/FieldPro/01 Dev Cabinet/00 Daily Notes"
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
FROM "Work/FieldPro/04 Lessons Learned/Bugs Fixed"
SORT file.mtime DESC
LIMIT 8
```

### 💡 Recent Lessons
```dataview
LIST
FROM "Work/FieldPro/04 Lessons Learned"
SORT file.mtime DESC
LIMIT 8
```

### 🧠 How To
```dataview
TABLE WITHOUT ID
  file.link AS "Bug / Fix",
  file.mtime AS "Updated"
FROM "Work/FieldPro/04 Lessons Learned/How To"
SORT file.mtime DESC
LIMIT 8
```
```dataview
LIST
FROM "Work/FieldPro/04 Lessons Learned/Things I Dont Want to Forget"
SORT file.mtime DESC
LIMIT 8
```

---




---


## 🧭 KNOWLEDGE

### Engineering Knowledge Areas

| Area             | Open                |
| ---------------- | ------------------- |
| 🏗️ Architecture | [[01 Architecture]] |
| 📦 Applications  | [[02 Applications]] |
| 💻 Backend       | [[03 Backend]]      |
| 🎨 Frontend      | [[04 Frontend]]     |
| 🗄️ Database     | [[05 Database]]     |

> These links assume the engineering knowledge-base notes/folders are available inside this vault. If those areas remain in a separate Obsidian vault, keep them as a separate knowledge vault rather than creating broken links here.

### FieldPro Knowledge

- [[04 Lessons Learned]]
- [[04 Lessons Learned/Bugs Fixed]]
- [[04 Lessons Learned/Performance]]
- [[04 Lessons Learned/Things I Dont Want to Forget]]
- [[07 Reference/Cheat Sheets]]
- [[09 How To]]
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