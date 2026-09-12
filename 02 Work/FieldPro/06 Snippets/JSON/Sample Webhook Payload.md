---
tags: [snippet, json]
---

# Sample Webhook Payload (WorkOrder Completed)

```json
{
  "eventId": "3f2a1b4c-9d8e-4f1a-8b2c-1a2b3c4d5e6f",
  "eventType": "WorkOrder.Completed",
  "occurredAtUtc": "2026-07-27T14:32:00Z",
  "data": {
    "workOrderId": "a1b2c3d4-0000-0000-0000-000000000001",
    "customerId": "c1d2e3f4-0000-0000-0000-000000000002",
    "technicianId": "t1e2d3c4-0000-0000-0000-000000000003",
    "completedAtUtc": "2026-07-27T14:30:00Z"
  }
}
```

See [[Webhook Design for Third-Party Integrations]] for signature verification details.

#snippet #json
