---
tags: [daily]
date: {{date}}
---
## 🎯 Habits

```habits
```
# 📅 {{date:YYYY-MM-DD}}

> **Daily engineering log** — plan → execute → capture → review.

## 🧠 Remember

> Things I want to keep visible every day.

```dataview
LIST WITHOUT ID
  item.text
FROM ""
FLATTEN file.lists AS item
WHERE contains(item.text, "#remember")
SORT file.mtime DESC
LIMIT 10
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

## 📝 Yesterday

- 
---

## 🎯 Today

**Top priority:**  
- [ ] 

**Other priorities:**  
- [ ] 

## 🚧 Blockers

> Anything stopping progress today.

- None
---

## 📦 Work Items

> Link the work, bug, feature, PR, or investigation you are actively touching.

- 

---

## 💡 Lessons Learned

> Capture discoveries here first. Promote durable knowledge to `04 Lessons Learned`.

- 
---

## 📝 Notes

- 
---

## 📊 End-of-Day Summary

**Status:** 🟡 In Progress

### Completed

- 

### Still in Progress

- 

### Blockers

- None

### Tomorrow

- 

---

## 🔗 Related

**Sprint:**  
- 

**PR / Ticket:**  
- 

**Useful notes:**  
- 
