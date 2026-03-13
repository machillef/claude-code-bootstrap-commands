#Requires -Version 7.0
[CmdletBinding()]
param(
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoDir = $PSScriptRoot
$CodexDir = Join-Path $HOME '.codex'
$SkillSourceDir = Join-Path (Join-Path $RepoDir 'codex') 'skills'
$SkillDestDir = Join-Path $CodexDir 'skills'
$ReferenceSourceDir = Join-Path (Join-Path $RepoDir 'codex') 'reference'
$ReferenceDestRoot = Join-Path $CodexDir 'bootstrap-reference'
$ReferenceDestDir = Join-Path $ReferenceDestRoot 'claude-code-bootstrap-commands'
$AgentsFile = Join-Path $CodexDir 'AGENTS.md'
$ManagedStart = '<!-- BEGIN claude-code-bootstrap-commands -->'
$ManagedEnd = '<!-- END claude-code-bootstrap-commands -->'
$ManagedBlockBody = (Get-Content (Join-Path $RepoDir 'codex' 'templates' 'global-agents-block.md') -Raw).TrimEnd()
$ManagedBlock = @"
$ManagedStart
$ManagedBlockBody
$ManagedEnd
"@

function Test-SymlinkCapability {
    $testDir = Join-Path ([System.IO.Path]::GetTempPath()) "codex-symlink-test-$(Get-Random)"
    $testLink = "$testDir-link"
    try {
        New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        New-Item -ItemType SymbolicLink -Path $testLink -Target $testDir -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
    finally {
        Remove-Item $testLink -Force -ErrorAction SilentlyContinue
        Remove-Item $testDir -Force -ErrorAction SilentlyContinue
    }
}

function Get-LinkTarget {
    param([System.IO.FileSystemInfo]$Item)

    if ($Item.LinkType -eq 'SymbolicLink') {
        if ($Item.Target -is [System.Array]) {
            return $Item.Target[0]
        }

        return [string]$Item.Target
    }

    return $null
}

function Install-DirectoryLink {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label
    )

    if (Test-Path $Destination) {
        $item = Get-Item $Destination -Force
        $currentTarget = Get-LinkTarget -Item $item

        if ($currentTarget) {
            if ($currentTarget -eq $Source) {
                Write-Host "  ok       $Label  (already linked)"
                return
            }

            if (-not $Force) {
                Write-Host "  SKIPPED  $Label  (symlink exists pointing to: $currentTarget -- use -Force to relink)"
                return
            }

            Remove-Item $Destination -Force
            New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
            Write-Host "  updated  $Label  (relinked from: $currentTarget)"
            return
        }

        if (-not $Force) {
            Write-Host "  SKIPPED  $Label  (directory exists from another source; use -Force to override)"
            return
        }

        Remove-Item $Destination -Recurse -Force
        New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
        Write-Host "  updated  $Label  (replaced directory with symlink)"
        return
    }

    New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
    Write-Host "  linked   $Label"
}

function Backup-File {
    param([string]$Path)

    if (Test-Path $Path) {
        $stamp = Get-Date -Format 'yyyyMMddHHmmss'
        Copy-Item $Path "$Path.bootstrap-backup.$stamp"
    }
}

function Merge-AgentsBlock {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Set-Content -Path $Path -Value ($ManagedBlock + [Environment]::NewLine)
        Write-Host "  created  AGENTS.md  (managed bootstrap block only)"
        return
    }

    $content = Get-Content $Path -Raw
    $pattern = [regex]::Escape($ManagedStart) + '.*?' + [regex]::Escape($ManagedEnd)

    if ($content -match $pattern) {
        $updated = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $ManagedBlock }, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($updated -ne $content) {
            Backup-File -Path $Path
            Set-Content -Path $Path -Value $updated
            Write-Host "  updated  AGENTS.md  (refreshed managed bootstrap block)"
        }
        else {
            Write-Host "  ok       AGENTS.md  (managed bootstrap block already current)"
        }
        return
    }

    Backup-File -Path $Path
    $separator = if ($content.EndsWith([Environment]::NewLine)) { '' } else { [Environment]::NewLine }
    $updated = $content + $separator + [Environment]::NewLine + $ManagedBlock + [Environment]::NewLine
    Set-Content -Path $Path -Value $updated
    Write-Host "  updated  AGENTS.md  (appended managed bootstrap block)"
}

if (-not (Test-SymlinkCapability)) {
    Write-Error @"
Cannot create symlinks. Either:
  1. Enable Developer Mode: Settings > Privacy & security > For developers > Developer Mode
  2. Or run this script as Administrator.
"@
    exit 1
}

Write-Host "Installing Codex bootstrap workflow from: $RepoDir"
Write-Host "Destination: $CodexDir"
Write-Host "(skills are linked; AGENTS.md is merged conservatively)"
Write-Host ""

if (-not (Test-Path $SkillDestDir)) {
    New-Item -ItemType Directory -Path $SkillDestDir -Force | Out-Null
}

if (-not (Test-Path $ReferenceDestRoot)) {
    New-Item -ItemType Directory -Path $ReferenceDestRoot -Force | Out-Null
}

foreach ($skillDir in Get-ChildItem $SkillSourceDir -Directory) {
    Install-DirectoryLink -Source $skillDir.FullName -Destination (Join-Path $SkillDestDir $skillDir.Name) -Label "skill:   $($skillDir.Name)"
}

Install-DirectoryLink -Source $ReferenceSourceDir -Destination $ReferenceDestDir -Label 'reference bundle'

Merge-AgentsBlock -Path $AgentsFile

Write-Host ""
Write-Host "Done. Restart Codex if it is already running."
Write-Host "No changes were made to config.toml."
Write-Host "Reference bundle: $ReferenceDestDir"
