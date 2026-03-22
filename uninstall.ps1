#Requires -Version 7.0
<#
.SYNOPSIS
    Remove symlinks created by install.ps1.
.DESCRIPTION
    Only removes symlinks that point into THIS repo — never touches other files.
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoDir = $PSScriptRoot
$ClaudeDir = Join-Path $HOME '.claude'

function Remove-IfOurs {
    param(
        [string]$Destination,
        [string]$Label
    )

    if (Test-Path $Destination) {
        $item = Get-Item $Destination -Force
        if ($item.LinkType -eq 'SymbolicLink') {
            $target = $item.Target
            if ($target -like "*$RepoDir*") {
                Remove-Item $Destination -Force
                Write-Host "  removed  $Label"
            }
            else {
                Write-Host "  skipped  $Label  (symlink points elsewhere: $target)"
            }
        }
        else {
            Write-Host "  skipped  $Label  (not a symlink -- not ours)"
        }
    }
}

Write-Host "Removing bootstrap workflow symlinks from: $ClaudeDir"
Write-Host "(only removes symlinks pointing into: $RepoDir)"
Write-Host ""

# --- Commands ---
foreach ($f in Get-ChildItem (Join-Path $RepoDir '.claude' 'commands') -Filter '*.md' -ErrorAction SilentlyContinue) {
    Remove-IfOurs -Destination (Join-Path $ClaudeDir 'commands' $f.Name) -Label "command: $($f.Name)"
}

# --- Agents ---
foreach ($f in Get-ChildItem (Join-Path $RepoDir '.claude' 'agents') -Filter '*.md' -ErrorAction SilentlyContinue) {
    Remove-IfOurs -Destination (Join-Path $ClaudeDir 'agents' $f.Name) -Label "agent:   $($f.Name)"
}

# --- Skills ---
foreach ($skillDir in Get-ChildItem (Join-Path $RepoDir '.claude' 'skills') -Directory -ErrorAction SilentlyContinue) {
    Remove-IfOurs -Destination (Join-Path $ClaudeDir 'skills' $skillDir.Name) -Label "skill:   $($skillDir.Name)"
}

# --- Hooks ---
$hookFiles = Get-ChildItem (Join-Path $RepoDir '.claude' 'hooks' '*.sh') -ErrorAction SilentlyContinue
foreach ($f in $hookFiles) {
    Remove-IfOurs -Destination (Join-Path $ClaudeDir 'hooks' $f.Name) -Label "hook:    $($f.Name)"
}

Write-Host ""
Write-Host "Done. Symlinks removed."
Write-Host ""
Write-Host "To install as a plugin instead:"
Write-Host "  claude plugin add machillef/claude-code-bootstrap-commands --scope user"
