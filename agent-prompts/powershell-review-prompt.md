# PowerShell Review Rubric

## Review Priorities

### CRITICAL — Security
- **Script injection**: Unvalidated input passed to `Invoke-Expression`, `[ScriptBlock]::Create()`, or string-based `Invoke-Command`
- **Credential exposure**: Plaintext passwords in scripts, `ConvertTo-SecureString -AsPlainText` with hardcoded strings
- **Command injection**: User input interpolated into strings passed to `cmd /c`, `Start-Process`, or pipeline commands without validation
- **Hardcoded secrets**: API keys, tokens, connection strings in source — use `Get-Secret`, environment variables, or Azure Key Vault
- **Unrestricted execution policy**: Scripts that bypass execution policy with `-ExecutionPolicy Bypass` without justification
- **Remote code execution**: `Invoke-WebRequest | Invoke-Expression` patterns (download-and-execute)

### HIGH — Approved Verb Usage
- **Non-standard verbs**: Functions not using approved verbs (Get/Set/New/Remove/Start/Stop/Enable/Disable/Invoke/Test) — run `Get-Verb` for the full list
- **Pipeline efficiency**: Using `ForEach-Object` or `Where-Object` cmdlets when pipeline-native filtering is available and more efficient
- **Error handling**: Missing `try/catch/finally` blocks, incorrect `-ErrorAction` patterns (`-ErrorAction SilentlyContinue` hiding real failures)
- **Module security**: Missing `#Requires` statements for required modules/versions, importing modules without version pinning

### HIGH — Error Handling
- **Missing terminating error handling**: No `try/catch` around operations that can fail (file I/O, network, registry)
- **Non-terminating errors ignored**: Missing `-ErrorAction Stop` on cmdlets where failures should halt execution
- **Bare `catch` blocks**: `catch { }` with no logging or rethrow — handle or propagate
- **Missing `$ErrorActionPreference`**: Scripts without a global error action preference at the top

### HIGH — Code Quality
- **Large functions**: Over 50 lines — extract into helper functions
- **Deep nesting**: More than 4 levels of `if`/`foreach`/`try` — simplify with early returns or helper functions
- **String concatenation**: Using `+` operator in loops — use `-join`, `StringBuilder`, or `[System.Text.StringBuilder]`
- **Cmdlet aliases in scripts**: Using aliases (`%`, `?`, `ls`, `cat`) instead of full cmdlet names in saved scripts

### MEDIUM — PSScriptAnalyzer Compliance
- **PSScriptAnalyzer rule violations**: Any warnings from default rule set
- **Comment-based help**: Public functions missing `.SYNOPSIS`, `.DESCRIPTION`, `.PARAMETER`, `.EXAMPLE`
- **Parameter validation**: Missing `[ValidateSet()]`, `[ValidatePattern()]`, `[ValidateRange()]`, `[ValidateNotNullOrEmpty()]` on parameters
- **Output type declarations**: Functions missing `[OutputType()]` attribute
- **ShouldProcess for destructive operations**: Functions that modify/delete resources missing `[CmdletBinding(SupportsShouldProcess)]` and `$PSCmdlet.ShouldProcess()` calls

### MEDIUM — Best Practices
- **`Write-Host` in functions**: Use `Write-Output`, `Write-Verbose`, or `Write-Information` for pipeline-friendly output
- **Positional parameters**: Using positional arguments in scripts — use named parameters for readability
- **Magic numbers/strings**: Use constants, enums, or configuration for repeated values
- **Missing `[CmdletBinding()]`**: Advanced functions without `CmdletBinding` attribute
- **Backtick line continuation**: Prefer splatting or natural line breaks over backtick continuation

## Diagnostic Commands

```bash
pwsh -Command "Invoke-ScriptAnalyzer -Path . -Recurse -Severity Error,Warning"
pwsh -Command "Invoke-Pester -CI"
```

## Approval Criteria

- **Approve**: No CRITICAL or HIGH issues
- **Warning**: MEDIUM issues only (can merge with caution)
- **Block**: CRITICAL or HIGH issues found
