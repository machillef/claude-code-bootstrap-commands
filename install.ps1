#Requires -Version 7.0
<#
.SYNOPSIS
    Bootstrap workflow installer for PowerShell / Windows.
.DESCRIPTION
    Creates symlinks from ~/.claude/ into this repo so that git pull is all
    you need to pick up updates - no re-install required.

    SAFE BY DESIGN:
      - Never touches ~/.claude/CLAUDE.md
      - Never touches ~/.claude/rules/
      - Only creates symlinks for files that come from this repo
      - If a file exists and is already a symlink to this repo, updates it
      - If a file exists from another source (not a symlink to us), warns and skips

    Run once after cloning. Re-run only if you move the repo to a new path.

    PREREQUISITES:
      Windows 10 1703+ with Developer Mode enabled, or run as Administrator.
      Developer Mode: Settings > Privacy & security > For developers > Developer Mode.
.PARAMETER Force
    Override existing files or symlinks from other sources.
.EXAMPLE
    .\install.ps1
    .\install.ps1 -Force
#>

[CmdletBinding()]
param(
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoDir = $PSScriptRoot
$ClaudeDir = Join-Path $HOME '.claude'

function Test-SymlinkCapability {
    $testDir = Join-Path ([System.IO.Path]::GetTempPath()) "symlink-test-$(Get-Random)"
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

function Install-Link {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label
    )

    if (Test-Path $Destination) {
        $item = Get-Item $Destination -Force
        if ($item.LinkType -eq 'SymbolicLink') {
            $currentTarget = $item.Target
            if ($currentTarget -eq $Source) {
                Write-Host "  ok       $Label  (already linked)"
            }
            elseif ($Force) {
                Remove-Item $Destination -Force
                New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
                Write-Host "  updated  $Label  (relinked from: $currentTarget)"
            }
            else {
                Write-Host "  SKIPPED  $Label  (symlink exists pointing to: $currentTarget -- use -Force to relink)"
            }
        }
        else {
            # Regular file or directory from another source
            if ($Force) {
                if ($item.PSIsContainer) {
                    Remove-Item $Destination -Recurse -Force
                }
                else {
                    Remove-Item $Destination -Force
                }
                New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
                Write-Host "  updated  $Label  (replaced existing item with symlink)"
            }
            else {
                Write-Host "  SKIPPED  $Label  (existing item exists from another source; use -Force to override)"
            }
        }
    }
    else {
        New-Item -ItemType SymbolicLink -Path $Destination -Target $Source | Out-Null
        Write-Host "  linked   $Label"
    }
}

# --- Preflight: verify symlink capability ---
if (-not (Test-SymlinkCapability)) {
    Write-Error @"
Cannot create symlinks. Either:
  1. Enable Developer Mode: Settings > Privacy & security > For developers > Developer Mode
  2. Or run this script as Administrator.
"@
    exit 1
}

Write-Host "Installing bootstrap workflow from: $RepoDir"
Write-Host "Destination: $ClaudeDir"
Write-Host "(using symlinks -- git pull will sync updates automatically)"
Write-Host ""

# --- Commands ---
$commandsDir = Join-Path $ClaudeDir 'commands'
if (-not (Test-Path $commandsDir)) { New-Item -ItemType Directory -Path $commandsDir -Force | Out-Null }
foreach ($f in Get-ChildItem (Join-Path $RepoDir '.claude' 'commands') -Filter '*.md') {
    Install-Link -Source $f.FullName -Destination (Join-Path $commandsDir $f.Name) -Label "command: $($f.Name)"
}

# --- Agents ---
$agentsDir = Join-Path $ClaudeDir 'agents'
if (-not (Test-Path $agentsDir)) { New-Item -ItemType Directory -Path $agentsDir -Force | Out-Null }
foreach ($f in Get-ChildItem (Join-Path $RepoDir '.claude' 'agents') -Filter '*.md') {
    Install-Link -Source $f.FullName -Destination (Join-Path $agentsDir $f.Name) -Label "agent:   $($f.Name)"
}

# --- Skills ---
$skillsDir = Join-Path $ClaudeDir 'skills'
if (-not (Test-Path $skillsDir)) { New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null }
foreach ($skillDir in Get-ChildItem (Join-Path $RepoDir '.claude' 'skills') -Directory) {
    Install-Link -Source $skillDir.FullName -Destination (Join-Path $skillsDir $skillDir.Name) -Label "skill:   $($skillDir.Name)"
}

Write-Host ""
Write-Host "Done. Restart Claude Code for changes to take effect."
Write-Host "Future updates: git pull  (symlinks stay live -- no re-install needed)"
Write-Host ""
Write-Host "Available in every repo after restart:"
Write-Host "  /quick-change <description>        small change, 1-3 files, no bootstrap overhead"
Write-Host "  /bootstrap-existing <initiative>   medium or large change, creates docs/ai/"
Write-Host "  /bootstrap-new <project>           greenfield project, creates docs/ai/"
Write-Host "  /continue-work <initiative>        resume after bootstrap"
Write-Host "  /consolidate-learnings             merge learned skills into parent skill gotchas"
Write-Host "  /skill-health                      audit skill structure against best practices"
Write-Host "  /skill-improve <skill>             iteratively improve a specific skill"
Write-Host "  /retro <initiative>                retrospective with metrics and learnings"
