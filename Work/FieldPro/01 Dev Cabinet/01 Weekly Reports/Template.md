---
tags:
  - weekly-report
  - "#wee2"
week: 2026-W29
---
# 🗓️ Week 29 — July 13–17, 2026

> [!summary] 📌 Weekly Summary
> Closed out Sprint 30 (invoicing v2). Started ramping into Sprint 31 planning. Spent meaningful time on production support for the invoicing rollout.

---

## 🚀 Completed

- Shipped invoicing v2 to production
  - Partial payments
  - Automatic tax recalculation
- Fixed 3 post-launch bugs
  - Most notably, a rounding error in tax calculation for multi-line invoices
  - [[Rounding Errors in Tax Calculation]]
- Wrote [[Sprint 30 Retrospective]]

---

## 🔄 In Progress

- Sprint 31 planning
  - Scheduling engine performance work

---

## ⚠️ Risks / Blockers

> [!warning] Warning
> Support ticket volume around invoicing was higher than expected during the first two days post-launch. Stabilized by Thursday.

---

## 🎯 Next Week

- Kick off Sprint 31
  - Technician-matching query performance
- Onboarding preparation for new hire starting Aug 3

---

## 📝 Daily Highlights

> [!info] Automatically Collected
> Anything in your daily notes linked to [[Template]] will appear below.

```dataview
LIST
WHERE contains(file.outlinks, [[2026-W29]])
SORT file.name ASC