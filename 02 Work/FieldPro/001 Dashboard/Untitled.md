# 🧑‍💻 Engineering Dashboard

```dataviewjs
// ============================================================
// PERSONAL ENGINEERING DASHBOARD
// ============================================================

const DAILY_NOTES = "02 Work/FieldPro/002 Dev Cabinet/00 Daily Notes";

// ------------------------------------------------------------
// Today
// ------------------------------------------------------------
const today = window.moment().startOf("day");

// ------------------------------------------------------------
// Get only valid daily-note pages
// Includes all subfolders under DAILY_NOTES
// ------------------------------------------------------------
const pages = dv.pages(`"${DAILY_NOTES}"`)
    .where(p =>
        p &&
        p.file &&
        p.file.name &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.file.name)
    )
    .array();

// ------------------------------------------------------------
// Convert filename to date safely
// ------------------------------------------------------------
function getDate(page) {
    return window.moment(page.file.name, "YYYY-MM-DD", true).startOf("day");
}

// ------------------------------------------------------------
// Keep only pages with valid dates
// ------------------------------------------------------------
const dailyPages = pages
    .filter(p => getDate(p).isValid())
    .sort((a, b) => getDate(b).valueOf() - getDate(a).valueOf());

// ------------------------------------------------------------
// Get everything listed under "Today"
// ------------------------------------------------------------
function getTodayItems(page) {
    if (!page || !page.file || !page.file.lists) {
        return [];
    }

    return page.file.lists
        .filter(item =>
            item &&
            item.section &&
            item.section.subpath &&
            item.section.subpath.trim().endsWith("Today")
        );
}

// ------------------------------------------------------------
// Date ranges
// ------------------------------------------------------------
const weekStart = window.moment(today).subtract(6, "days").startOf("day");
const monthStart = window.moment(today).startOf("month");

// ------------------------------------------------------------
// Pages for the last 7 days
// ------------------------------------------------------------
const weekPages = dailyPages.filter(page => {
    const d = getDate(page);
    return d.valueOf() >= weekStart.valueOf() &&
           d.valueOf() <= today.valueOf();
});

// ------------------------------------------------------------
// Pages for this month
// ------------------------------------------------------------
const monthPages = dailyPages.filter(page => {
    const d = getDate(page);
    return d.valueOf() >= monthStart.valueOf() &&
           d.valueOf() <= today.valueOf();
});

// ------------------------------------------------------------
// Collect work items
// ------------------------------------------------------------
const weekItems = weekPages.flatMap(page => getTodayItems(page));
const monthItems = monthPages.flatMap(page => getTodayItems(page));

// ------------------------------------------------------------
// Task statistics
// ------------------------------------------------------------
const weekTasks = weekItems.filter(item => item.task);
const weekCompleted = weekTasks.filter(item => item.completed).length;

const monthTasks = monthItems.filter(item => item.task);
const monthCompleted = monthTasks.filter(item => item.completed).length;

const weekCompletion =
    weekTasks.length > 0
        ? Math.round((weekCompleted / weekTasks.length) * 100)
        : 0;

// ------------------------------------------------------------
// CSS
// ------------------------------------------------------------
const style = document.createElement("style");

style.textContent = `
.engineering-dashboard {
    font-family: var(--font-text);
}

.engineering-dashboard .hero {
    padding: 24px;
    margin-bottom: 20px;
    border-radius: 16px;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-secondary);
}

.engineering-dashboard .hero-title {
    font-size: 28px;
    font-weight: 800;
}

.engineering-dashboard .hero-subtitle {
    margin-top: 6px;
    color: var(--text-muted);
    font-size: 14px;
}

.engineering-dashboard .section-title {
    margin-top: 28px;
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 750;
}

.engineering-dashboard .cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.engineering-dashboard .card {
    padding: 16px;
    border-radius: 14px;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-secondary);
}

.engineering-dashboard .card-label {
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
}

.engineering-dashboard .card-value {
    margin-top: 6px;
    font-size: 25px;
    font-weight: 800;
}

.engineering-dashboard .card-sub {
    margin-top: 3px;
    color: var(--text-muted);
    font-size: 11px;
}

.engineering-dashboard .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
}

.engineering-dashboard .day {
    text-align: center;
}

.engineering-dashboard .bar-container {
    height: 110px;
    display: flex;
    align-items: end;
    justify-content: center;
}

.engineering-dashboard .bar {
    width: 42px;
    min-height: 4px;
    border-radius: 8px 8px 3px 3px;
    background: var(--interactive-accent);
}

.engineering-dashboard .day-count {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 700;
}

.engineering-dashboard .day-name {
    margin-top: 2px;
    color: var(--text-muted);
    font-size: 11px;
}

.engineering-dashboard .work-list {
    border: 1px solid var(--background-modifier-border);
    border-radius: 14px;
    overflow: hidden;
}

.engineering-dashboard .work-item {
    padding: 11px 14px;
    border-bottom: 1px solid var(--background-modifier-border);
}

.engineering-dashboard .work-item:last-child {
    border-bottom: none;
}

.engineering-dashboard .work-date {
    margin-bottom: 3px;
    color: var(--text-muted);
    font-size: 11px;
}

.engineering-dashboard .summary {
    padding: 16px;
    border-radius: 14px;
    border: 1px solid var(--background-modifier-border);
    background: var(--background-secondary);
    line-height: 1.7;
}

@media (max-width: 900px) {
    .engineering-dashboard .cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .engineering-dashboard .week-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
`;

document.head.appendChild(style);

// ------------------------------------------------------------
// Dashboard container
// ------------------------------------------------------------
const root = dv.el("div", "");
root.className = "engineering-dashboard";

// ------------------------------------------------------------
// Header
// ------------------------------------------------------------
root.innerHTML = `
<div class="hero">
    <div class="hero-title">🧑‍💻 Engineering Dashboard</div>
    <div class="hero-subtitle">
        ${today.format("dddd, MMMM D, YYYY")} · Personal development overview
    </div>
</div>
`;

// ------------------------------------------------------------
// KPI cards
// ------------------------------------------------------------
const cards = document.createElement("div");
cards.className = "cards";

cards.innerHTML = `
<div class="card">
    <div class="card-label">LAST 7 DAYS</div>
    <div class="card-value">${weekPages.length}</div>
    <div class="card-sub">days logged</div>
</div>

<div class="card">
    <div class="card-label">WORK ITEMS</div>
    <div class="card-value">${weekItems.length}</div>
    <div class="card-sub">recorded this week</div>
</div>

<div class="card">
    <div class="card-label">THIS MONTH</div>
    <div class="card-value">${monthItems.length}</div>
    <div class="card-sub">${monthPages.length} active days</div>
</div>

<div class="card">
    <div class="card-label">TASK COMPLETION</div>
    <div class="card-value">${weekCompletion}%</div>
    <div class="card-sub">${weekCompleted} / ${weekTasks.length}</div>
</div>
`;

root.appendChild(cards);

// ------------------------------------------------------------
// Weekly activity
// ------------------------------------------------------------
const weeklyTitle = document.createElement("div");
weeklyTitle.className = "section-title";
weeklyTitle.textContent = "📈 Last 7 Days";
root.appendChild(weeklyTitle);

const weekGrid = document.createElement("div");
weekGrid.className = "week-grid";

const activity = [];

for (let i = 6; i >= 0; i--) {
    const date = window.moment(today).subtract(i, "days");

    const page = dailyPages.find(p =>
        getDate(p).valueOf() === date.valueOf()
    );

    const count = page ? getTodayItems(page).length : 0;

    activity.push({
        date: date,
        count: count
    });
}

const maxCount = Math.max(
    ...activity.map(x => x.count),
    1
);

for (const day of activity) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    const height = Math.max(
        (day.count / maxCount) * 100,
        4
    );

    dayDiv.innerHTML = `
        <div class="bar-container">
            <div class="bar" style="height:${height}%"></div>
        </div>
        <div class="day-count">${day.count}</div>
        <div class="day-name">${day.date.format("ddd")}</div>
    `;

    weekGrid.appendChild(dayDiv);
}

root.appendChild(weekGrid);

// ------------------------------------------------------------
// Recent work
// ------------------------------------------------------------
const recentTitle = document.createElement("div");
recentTitle.className = "section-title";
recentTitle.textContent = "📝 Recent Work";
root.appendChild(recentTitle);

const workList = document.createElement("div");
workList.className = "work-list";

const recentItems = [];

for (const page of weekPages) {
    const items = getTodayItems(page);

    for (const item of items) {
        recentItems.push({
            date: getDate(page),
            text: item.text
        });
    }
}

recentItems.sort((a, b) => b.date.valueOf() - a.date.valueOf());

if (recentItems.length === 0) {
    workList.innerHTML = `
        <div class="work-item">
            No work recorded in the last 7 days.
        </div>
    `;
} else {
    for (const item of recentItems.slice(0, 20)) {
        const row = document.createElement("div");
        row.className = "work-item";

        row.innerHTML = `
            <div class="work-date">
                ${item.date.format("MMM D, YYYY")}
            </div>
            <div>${item.text}</div>
        `;

        workList.appendChild(row);
    }
}

root.appendChild(workList);

// ------------------------------------------------------------
// Weekly + Monthly summary
// ------------------------------------------------------------
const summaryTitle = document.createElement("div");
summaryTitle.className = "section-title";
summaryTitle.textContent = "📊 Summary";
root.appendChild(summaryTitle);

const summary = document.createElement("div");
summary.className = "summary";

summary.innerHTML = `
<strong>Last 7 days</strong><br>
${weekPages.length} daily notes recorded.<br>
${weekItems.length} work items recorded.<br>
${weekCompleted} of ${weekTasks.length} tasks completed (${weekCompletion}%).

<br><br>

<strong>This month</strong><br>
${monthPages.length} active days recorded.<br>
${monthItems.length} work items recorded.<br>
${monthCompleted} of ${monthTasks.length} tasks completed.
`;

root.appendChild(summary);
```