---
name: security-audit
description: "Structured security audit for application code and infrastructure. Covers secrets, dependencies, CI/CD, IaC, and OWASP top risks."
---

> **Platform:** This skill works on Claude Code and Codex. See `references/platform-map.md` for tool mapping.

# Security Audit

Structured security review adapted for multi-stack environments (.NET/C#, Python, PowerShell, React, IaC). Two modes: quick scan (targeted, 5-10 min) and comprehensive (full surface, 30-60 min).

## When to Use

- Manually via `/security` or `/security --comprehensive`
- As a complement to the execution-loop's security step when deeper tool-assisted scanning is warranted
- Before shipping code that handles user input, payment flows, or credential management
- Periodically as a hygiene check (e.g., monthly)

## Inputs

- **Mode**: `quick` (default) or `comprehensive`
- **Scope** (optional): directory or file list to focus on. If omitted, audits the entire repo.

---

## Mode: Quick vs Comprehensive

### Quick mode (default)

Run Phases 1-2 in full. Run Phases 3-4 only on files in the provided scope or files changed in the current branch. Detect the default branch dynamically:
```bash
BASE=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@') || BASE="main"
git diff --name-only ${BASE}...HEAD
```
Skip findings that require deep manual review.

### Comprehensive mode (`--comprehensive`)

Run all phases on the entire repository. Include:
- Full git history secrets scan (not just recent)
- Dependency tree analysis (transitive dependencies)
- All CI/CD workflows, not just recently changed
- Full OWASP review of all controllers/handlers/routes
- Kubernetes manifest audit across all namespaces

Estimate the time cost before starting: "Comprehensive audit of N files across M stacks — estimated 30-45 minutes."

Report findings after each completed phase rather than buffering the entire report. If any single phase exceeds 10 minutes, report partial results and note the phase was truncated.

---

## Phase 0: Stack Detection

Detect the project's technology stack to scope the audit. Do not ask — infer from files:

| Indicator | Stack |
|-----------|-------|
| `*.csproj`, `*.sln` | .NET / C# |
| `pyproject.toml`, `requirements.txt`, `setup.py` | Python |
| `package.json`, `*.tsx`, `*.jsx` | Node.js / React |
| `*.ps1`, `*.psm1` | PowerShell |
| `Dockerfile`, `docker-compose.yml` | Docker |
| `*.tf`, `*.tfvars` | Terraform |
| `Chart.yaml`, `values.yaml`, `templates/` | Helm |
| `*.yaml` in `.github/workflows/` | GitHub Actions |
| `Makefile`, `*.go` | Go |
| `Cargo.toml` | Rust |

Multiple stacks are common. Run all applicable phases.

---

## Phase 1: Secrets Archaeology

Scan for secrets that should not be in the repository.

### In git history

For quick mode, limit traversal depth:
```bash
git log --all --diff-filter=A -n 500 -- '*.env' '*.pem' '*.key' '*.pfx' '*.p12' '*credentials*' '*secret*' '*token*' 2>/dev/null | head -20
```

For comprehensive mode, scan the full history (may be slow on large repos):
```bash
git log --all --diff-filter=A -- '*.env' '*.pem' '*.key' '*.pfx' '*.p12' '*credentials*' '*secret*' '*token*' 2>/dev/null | head -50
```

Check if any sensitive files were ever committed and later removed (they remain in history).

### In current tree

Search for patterns that indicate hardcoded secrets. Use `rg -n` (with line numbers) to identify matches WITHOUT reading entire files — this avoids pulling secret values into the context window:

```bash
rg -i -n '(api[_-]?key|secret[_-]?key|password|token|connection[_-]?string|private[_-]?key)\s*[:=]' --type-not binary
```

Assess severity from the rg output line (variable name, surrounding context) rather than reading the full file with the Read tool. Only read a file if the rg output is insufficient to classify the finding.

Exclude known false positives: test fixtures, documentation examples, variable declarations with empty values. Also exclude matches in `skills/` directories within `*.md` files (these contain example patterns, not actual secrets).

### In configuration files

- Check `.env` files are in `.gitignore`
- Check `appsettings.json` / `appsettings.Development.json` for connection strings with passwords
- Check `docker-compose.yml` for hardcoded environment variables
- Check `values.yaml` for secrets not using sealed-secrets or external-secrets
- Check `*.tfvars` are in `.gitignore`

### Verdict per finding

| Finding | Severity | Action |
|---------|----------|--------|
| Active secret in current tree | CRITICAL | Remove immediately, rotate the credential |
| Secret in git history (removed from tree) | HIGH | Rotate the credential, consider `git filter-repo` |
| `.env` not gitignored | HIGH | Add to `.gitignore` |
| Placeholder/example secret | INFO | No action unless it matches a real format |

---

## Phase 2: Dependency Supply Chain

Audit dependencies for known vulnerabilities. These commands require network access to fetch vulnerability databases. If a command hangs or fails with a network error, note "Tool unavailable (network)" and continue.

### Tool availability

Before running optional tools, check availability:
```bash
command -v pip-audit >/dev/null 2>&1 && echo "available" || echo "not installed"
```

If a tool is not installed, note "Tool not available — manual review recommended" and continue to the next check.

### Per stack

| Stack | Command | What it checks |
|-------|---------|----------------|
| .NET | `dotnet list package --vulnerable` | NuGet CVEs |
| Python | `pip-audit` or `uv run pip-audit` (if pip-audit is installed in the venv) | PyPI CVEs |
| Node.js | `npm audit --json` or `pnpm audit --json` | npm CVEs |
| Rust | `cargo audit` (if installed) | crates.io CVEs |
| Go | `govulncheck ./...` (if installed) | Go module CVEs |

### Dependency hygiene

- Check for unpinned versions (`*`, `latest`, `>=` without upper bound)
- Check lock files are committed (`package-lock.json`, `uv.lock`, `packages.lock.json`)
- Check for deprecated packages (major version behind, archived repos)

### Verdict

| Finding | Severity | Action |
|---------|----------|--------|
| Known CVE with fix available | HIGH | Upgrade the dependency |
| Known CVE without fix | MEDIUM | Evaluate workaround or alternative |
| Unpinned version | MEDIUM | Pin to exact version |
| Missing lock file | HIGH | Generate and commit |

---

## Phase 3: CI/CD Pipeline Security

Audit CI/CD configuration for common vulnerabilities.

### GitHub Actions

```bash
rg -l 'uses:' .github/workflows/ 2>/dev/null
```

For each workflow:
- **Pinned actions:** Are actions pinned to full 40-character SHA? Find unpinned actions:
  ```bash
  rg 'uses:\s+\S+@' .github/workflows/ | rg -v '@[0-9a-f]{40}\b'
  rg 'uses:\s+\S+$' .github/workflows/  # actions with no @ at all
  ```
- **Secrets exposure:** Are secrets passed to untrusted steps? Check for `${{ secrets.* }}` in `run:` blocks. Report only the secret name and workflow file, not the full run block context.
- **Pull request triggers:** Does `pull_request_target` expose secrets to fork PRs?
- **Permissions:** Are workflow permissions scoped (`permissions:` block) or using the default (broad)?
- **Artifact security:** Are artifacts downloaded and executed without verification?

Run `actionlint` if available:
```bash
command -v actionlint >/dev/null 2>&1 && actionlint .github/workflows/*.yml
```

### Docker

- Base image pinning: `FROM image:tag` should use digest (`@sha256:...`) or specific version, not `latest`
- Multi-stage builds: final stage should not contain build tools
- User: runs as non-root (`USER` directive present)?
- Secrets in build args: `ARG` should not contain passwords/tokens

### Terraform / IaC

- State file exposure: is `*.tfstate` in `.gitignore`?
- Remote backend: is state stored remotely with encryption?
- Provider credentials: are they in environment variables, not `.tf` files?
- Resource permissions: are IAM roles/policies following least privilege?

### Verdict

| Finding | Severity | Action |
|---------|----------|--------|
| Unpinned action | HIGH | Pin to full SHA |
| Secrets in PR target workflow | CRITICAL | Refactor to pull_request + workflow_run |
| Docker running as root | MEDIUM | Add USER directive |
| Terraform state in repo | CRITICAL | Move to remote backend |

---

## Phase 4: Application Security (OWASP-informed)

Review application code for common vulnerability patterns. Focus areas depend on the stack.

### Input validation

- Are all user inputs validated at the boundary (controller/handler level)?
- Are SQL queries parameterized? Search for string concatenation in queries:
  ```bash
  rg '(Execute|Query|SqlCommand|cursor\.execute|\.query)\s*\(' --type-not binary -l
  ```
- Are HTML outputs encoded? Check for raw HTML insertion (`@Html.Raw`, `dangerouslySetInnerHTML`, `|safe`)

### Authentication and authorization

- Is authentication on all protected routes?
- Is authorization checked (not just authentication)?
- Are JWT tokens validated (signature, expiry, issuer)?
- Are passwords hashed with bcrypt/Argon2/PBKDF2 (not MD5/SHA1)?
- Is rate limiting configured on auth endpoints?

### Data protection

- Is sensitive data encrypted at rest?
- Are HTTPS redirects enforced?
- Are CORS policies restrictive (not `*`)?
- Are cookies marked `HttpOnly`, `Secure`, `SameSite`?

### .NET-specific

- Nullable reference types enabled? (`<Nullable>enable</Nullable>`)
- Anti-forgery tokens on POST endpoints? (`[ValidateAntiForgeryToken]`)
- `TreatWarningsAsErrors` enabled?
- `Microsoft.AspNetCore.Authorization` on controllers?

### Python-specific

- `SECRET_KEY` not hardcoded in settings?
- `DEBUG = False` in production config?
- `ALLOWED_HOSTS` configured?
- `csrf_protect` decorator or middleware active?

### IaC-specific

- Kubernetes: RBAC is restrictive (no `cluster-admin` for workloads)?
- Kubernetes: resource limits set on all containers?
- Kubernetes: network policies defined?
- Kubernetes: secrets not in plain text ConfigMaps?
- Helm: no sensitive values in `values.yaml` defaults?

---

## Output Format

```
SECURITY AUDIT REPORT
=====================
Mode: <quick | comprehensive>
Stack: <detected stacks>
Scope: <repo-wide | specific files>
Date: <YYYY-MM-DD>

Phase 1 — Secrets:
  CRITICAL: <count>
  HIGH: <count>
  - [CRITICAL] <file:line> — <description (value redacted)>
  - [HIGH] <file:line> — <description (value redacted)>

Phase 2 — Dependencies:
  HIGH: <count>
  MEDIUM: <count>
  - [HIGH] <package@version> — <CVE> — <fix available: yes/no>

Phase 3 — CI/CD:
  CRITICAL: <count>
  HIGH: <count>
  MEDIUM: <count>
  - [HIGH] <workflow:line> — <description>

Phase 4 — Application:
  CRITICAL: <count>
  HIGH: <count>
  MEDIUM: <count>
  - [HIGH] <file:line> — <description>

SUMMARY:
  Total findings: <count> (<critical> critical, <high> high, <medium> medium, <info> info)
  Immediate action required: <yes/no>
  Items requiring user decision:
    - [ ] <item>
    - [ ] <item>
```

---

## Rules

- Do not fix findings automatically — report them. The user decides what to fix and when.
- **Secret redaction:** When reporting secrets findings, NEVER include the actual secret value in the report. Report only the file path, line number, the variable/key name, and the pattern matched (e.g., `VARIABLE_NAME=<value redacted>`). Mask or truncate any credential material. If asked to display secret values after an audit, refuse and remind the user that secrets should not be surfaced in conversation.
- Distinguish between real vulnerabilities and defense-in-depth suggestions. Label severity honestly.
- Do not flag false positives. If a finding looks like a secret but is clearly a test fixture or example, skip it.
- Before running optional tools (`pip-audit`, `cargo audit`, `govulncheck`, `actionlint`), check availability with `command -v <tool> >/dev/null 2>&1`. If not found, note "Tool not available — manual review recommended" without attempting to run it.
- Each finding must include the file and line reference so the user can navigate directly.
