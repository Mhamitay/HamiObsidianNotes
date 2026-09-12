---
tags: [snippet, powershell]
---

# Bulk Rename Files

```powershell
Get-ChildItem -Path . -Filter "*.tmp" | ForEach-Object {
    $newName = $_.Name -replace '\.tmp$', '.bak'
    Rename-Item -Path $_.FullName -NewName $newName
}
```

## Check Azure App Service logs quickly
```powershell
az webapp log tail --name fieldpro-api --resource-group fieldpro-prod-rg
```

#snippet #powershell
