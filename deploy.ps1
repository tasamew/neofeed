# NeoFeed V2 — deploy.ps1
# Usage:
#   .\deploy.ps1                        # deploy as-is
#   .\deploy.ps1 "https://...exec"      # update GAS URL + deploy
#   .\deploy.ps1 "https://...exec" -m "fix: xyz"  # custom message

param(
    [string]$GasUrl = "",
    [string]$m = ""
)

$root  = "C:\Users\USER\Desktop\PraewPP\Web App Projects\NeoFeed\NeoFeed_V2"
$html  = "$root\NeoFeed.html"
$index = "$root\index.html"

# --- show current URL ---
$cur = (Select-String -Path $html -Pattern 'NEOFEED_GAS_URL\s*=\s*"([^"]+)"').Matches[0].Groups[1].Value
Write-Host "Current GAS URL: $cur"

# --- update URL if provided ---
if ($GasUrl) {
    $content = Get-Content $html -Raw
    $content = $content -replace '(window\.NEOFEED_GAS_URL\s*=\s*")[^"]*', "`${1}$GasUrl"
    Set-Content $html $content -NoNewline
    Write-Host "[OK] NEOFEED_GAS_URL → $GasUrl"
}

# --- sync index.html ---
Copy-Item $html $index -Force
Write-Host "[OK] index.html synced"

# --- git ---
$msg = if ($m) { $m } elseif ($GasUrl) { "deploy: update GAS URL" } else { "deploy: sync" }
git -C $root add NeoFeed.html index.html
git -C $root diff --cached --stat
git -C $root commit -m $msg
git -C $root push
Write-Host "[DONE] Pushed → valhalla-health/neofeed"
