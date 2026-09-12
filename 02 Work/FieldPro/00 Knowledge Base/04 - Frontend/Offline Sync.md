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

# Offline Sync

## Overview

The offline sync system allows field personnel to work without an internet connection and synchronize changes when connectivity is restored.

## Key Files

| File | Role |
|---|---|
| `ClientLibrary/src/syncup.ts` | Core sync engine |
| `ClientLibrary/src/OnlineToOffline.js` | Connectivity detection |
| `ClientLibrary/src/components/SyncOffline.vue` | Sync status UI |
| `ClientLibrary/src/indexdb/` | IndexedDB abstraction layer |
| `Web/API/Offline/` | Server-side sync endpoints |

## Flow

See [[Offline PWA Architecture]] for the full sequence diagram.

## Troubleshooting

See [[Offline Sync Issues]].

## Related

- [[Offline PWA Architecture]]
- [[Frontend Overview]]
- [[Vue Components]]
- [[Offline Sync Issues]]
