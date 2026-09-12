---
type: component
layer: frontend
status: active
technology: "TypeScript"
updated: 2025-01
tags:
  - system/frontend
  - component/service
---

# API Client Layer

## Overview

The `ClientLibrary/src/api/` folder contains **typed TypeScript modules** that wrap HTTP calls to the ASP.NET Core API controllers. Each module corresponds to one domain.

---

## Pattern

```typescript
// Example: JobApi.ts
export class JobApi {
	static async getAll(): Promise<JobModel[]> {
		const response = await fetch('/api/job');
		if (!response.ok) throw new Error(await response.text());
		return response.json();
	}

	static async getById(jobId: number): Promise<JobModel> {
		const response = await fetch(`/api/job/${jobId}`);
		// ...
	}

	static async create(model: CreateJobModel): Promise<JobModel> {
		const response = await fetch('/api/job', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(model)
		});
		// ...
	}
}
```

---

## Type Safety

Models in `ClientLibrary/src/models/` are TypeScript interfaces that mirror server-side C# DTOs in `Web/Models/`. Keeping them in sync is a **manual process** — a change on the server requires a corresponding change in the TS model.

> **TODO: Verify** — whether there is any automated TS type generation from server models.

---

## Authentication

API calls carry the ASP.NET Identity **cookie** automatically (same-origin). No manual token attachment is needed for standard browser-based calls.

---

## Error Handling

API modules typically throw on non-2xx responses. Vue components catch these errors and display them in the UI.

---

## Offline API

For offline-capable endpoints, the API client may write to IndexedDB instead of calling the server when offline. Connectivity check is performed via `OnlineToOffline.js` before deciding which path to take.

---

## Related

- [[Frontend Overview]]
- [[Vue Components]]
- [[API Controllers]]
- [[Offline Sync]]
