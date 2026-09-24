---
description: Good morning briefing — summarize what you did yesterday and what's planned today from your daily notes.
---

# Good Morning Briefing

Give the user a short, friendly morning briefing based on their daily work notes.

## Steps

1. **Determine the dates.** Use the "Today's date" from your environment. Yesterday = today minus one day. Format both as `YYYY-MM-DD`.
2. **Find the two notes** under `02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes/` by searching for files named `YYYY-MM-DD.md` (they live in week subfolders like `2026/Sep26/W4/`):
   - `"<yesterday-date>.md"` for the day before
   - `"<today-date>.md"` for today
   - Also scan parent folders if not found directly.
3. **Read both notes.**

## Output format

### ☀️ Good morning!

**Yesterday (YYYY-MM-DD) — what you got done:**
- Pull the completed work from the note's `Today` section, End-of-Day Summary, and any notes about finished items. Summarize the key accomplishments in bullets.

**Today's plan:**
- Summarize the `Top priority:` and `Other priorities:` checkboxes, plus any carried-over open items.

**Heads-up / carryovers:**
- List anything unfinished, explicitly marked as a test needed, or left as an open question (e.g. function names to fix, PRs to review).

## Rules

- If yesterday's or today's note doesn't exist, say so clearly instead of inventing content.
- Keep it concise — a scannable briefing, not a wall of text.
- If the note content references specific tickets/procedure names, keep those names verbatim.