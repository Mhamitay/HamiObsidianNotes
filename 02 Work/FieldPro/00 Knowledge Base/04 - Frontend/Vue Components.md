---
type: component
layer: frontend
status: active
technology: "Vue.js 2, TypeScript"
updated: 2025-01
tags:
  - system/frontend
  - component/service
---

# Vue Components

## Overview

The `ClientLibrary` project contains **400+ Vue 2 components** organized by domain. Components are TypeScript class-based (`vue-class-component` / `vue-property-decorator`) or Options API.

---

## Component Categories

| Category | Path | Notes |
|---|---|---|
| Page components | `src/pages/` | Top-level, one per Razor Page |
| Domain components | `src/components/{domain}/` | Feature-specific reusable components |
| Shared components | `src/components/shared/` | Modals, grids, inputs, layout |
| Offline components | `src/components/` (SyncOffline.vue) | Sync status UI |

---

## DevExtreme Components

Heavy use of DevExtreme Vue components:
- `DxDataGrid` — data tables with sorting, filtering, paging, export
- `DxForm` + `DxSimpleItem` — forms
- `DxChart`, `DxPieChart` — charts and graphs
- `DxPopup` — modal dialogs
- `DxSelectBox`, `DxDateBox`, `DxNumberBox` — inputs

DevExtreme handles complex grid scenarios (inline editing, batch editing, row reordering).

---

## Common Patterns

### Loading Data on Mount
```typescript
async created() {
	this.jobs = await JobApi.getAll();
}
```

### Error Handling
Components typically catch API errors and display them via a notification/toast or inline error message.

### Form Validation
Vuelidate decorators validate form fields before submission.

### Grid Export
DevExtreme grids support Excel export built-in. Some features also use `pdfmake` for PDF export.

---

## SyncOffline.vue

The offline sync status component. Displays:
- Number of pending records
- Sync in progress indicator
- Last sync time
- Manual sync trigger button

---

## Related

- [[Frontend Overview]]
- [[API Client Layer]]
- [[Offline Sync]]
- [[DevExpress Integration]]
- [[Client Library]]
