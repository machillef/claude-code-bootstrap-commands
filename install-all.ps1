#Requires -Version 7.0
[CmdletBinding()]
param(
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$claudeArgs = @()
$codexArgs = @()
if ($Force) {
    $claudeArgs += '-Force'
    $codexArgs += '-Force'
}

& (Join-Path $PSScriptRoot 'install.ps1') @claudeArgs
Write-Host ""
& (Join-Path $PSScriptRoot 'install-codex.ps1') @codexArgs
