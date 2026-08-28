---
tags: [snippet, bash]
---

# Docker and Deploy Helpers

```bash
# Tail logs for a specific container
docker logs -f --tail 200 fieldpro-api

# Clean up dangling images/volumes
docker system prune -f

# Quick health check loop
until curl -sf https://staging.fieldpro.internal/health; do
  echo "waiting for staging to be healthy..."
  sleep 5
done
echo "staging is healthy"
```

#snippet #bash
