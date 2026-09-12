---
type: component
layer: frontend
status: active
technology: "Vue.js 2, TypeScript"
updated: 2025-01
tags:
  - system/frontend
  - component/application
---

# Client Library

## Purpose

`ClientLibrary/ClientLibrary.esproj` is the **TypeScript + Vue.js 2 frontend project**. It compiles to JS bundles loaded by the Razor Pages and provides all interactive UI functionality.

---

## Technology

- **Vue.js 2** — component framework
- **TypeScript** — typed JS throughout
- **webpack** — module bundler
- **DevExtreme** — UI component library (grids, forms, charts)
- **Bootstrap-Vue** — Bootstrap 4 Vue components
- **Vuelidate** — form validation
- **Axios / fetch** — HTTP client
- **IndexedDB** — offline storage (via `idb` or custom wrapper)
- **pdfmake** — client-side PDF generation

---

## Build Output

Webpack compiles all Vue/TS to:
```
Web/wwwroot/js/v99/dist/
```

These files are served as static assets by the ASP.NET Core app. The `v99` folder name is a versioning convention — **TODO: Verify** if this is incremented on deploy.

---

## Project Structure

```
ClientLibrary/src/
	pages/          # Top-level page components (one per Razor Page)
	components/     # Reusable Vue components (~400+)
	models/         # TypeScript interfaces matching server DTOs
	api/            # Typed HTTP fetch/axios modules (one per domain)
	indexdb/        # IndexedDB offline storage layer
	store/          # Vuex store (global state, including store.debugging)
	syncup.ts       # Offline sync engine
	OnlineToOffline.js  # Connectivity detection
```

---

## Key Architectural Patterns

### Page Components
Each Razor Page has a corresponding Vue page component in `pages/`. The `.cshtml` file mounts the Vue app:
```html
<div id="app">
	<!-- Vue mounts here -->
</div>
<script>
	// passes server-side data as props
</script>
```

### API Client Modules
Each domain has a typed API module in `api/`, e.g., `JobApi.ts`. These wrap `fetch`/`axios` calls to the ASP.NET API controllers and return typed models.

### Debugging UI Controls
Per the project conventions:
> Show developer/testing-only UI controls only when `store.debugging` is enabled.

The global Vuex `store.debugging` flag gates debug-only UI elements.

### Offline Detection
`OnlineToOffline.js` monitors `navigator.onLine` and network events, triggering the sync process via `syncup.ts` when connectivity is restored.

---

## Related

- [[Frontend Overview]]
- [[Vue Components]]
- [[Offline Sync]]
- [[API Client Layer]]
- [[Offline PWA Architecture]]
- [[Applications Overview]]
