'use strict';

/**
 * Shared secret detection patterns used by safety hooks, observation capture,
 * and session-end-observer (defense-in-depth scrubbing).
 *
 * Inspired by Hermes-agent's redact.py which covers 20+ pattern categories.
 * Each entry has a `pattern` (RegExp) and a `label` (human-readable description).
 */
const SECRET_PATTERNS = [
  // Cloud provider keys
  { pattern: /AKIA[0-9A-Z]{16}/, label: 'AWS Access Key' },
  { pattern: /AIza[A-Za-z0-9\-_]{35}/, label: 'Google API Key' },

  // GitHub tokens
  { pattern: /ghp_[A-Za-z0-9_]{36,}/, label: 'GitHub Personal Access Token' },
  { pattern: /gho_[A-Za-z0-9_]{36,}/, label: 'GitHub OAuth Token' },
  { pattern: /ghs_[A-Za-z0-9_]{36,}/, label: 'GitHub Server Token' },
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/, label: 'GitHub Fine-Grained PAT' },

  // AI provider keys
  { pattern: /sk-[a-zA-Z0-9]{20,}/, label: 'OpenAI API Key' },
  { pattern: /sk-ant-[A-Za-z0-9\-_]{20,}/, label: 'Anthropic API Key' },

  // Private keys and certificates
  { pattern: /-----BEGIN.*PRIVATE KEY-----/, label: 'Private Key' },
  { pattern: /-----BEGIN CERTIFICATE-----/, label: 'Certificate' },

  // Communication platform tokens
  { pattern: /xox[bpsa]-[A-Za-z0-9-]+/, label: 'Slack Token' },
  { pattern: /[0-9]+:AA[A-Za-z0-9\-_]{33}/, label: 'Telegram Bot Token' },

  // Payment platform keys
  { pattern: /sk_live_[A-Za-z0-9]+/, label: 'Stripe Secret Key' },
  { pattern: /rk_live_[A-Za-z0-9]+/, label: 'Stripe Restricted Key' },

  // Package registry tokens
  { pattern: /npm_[A-Za-z0-9]{36}/, label: 'npm Token' },
  { pattern: /pypi-[A-Za-z0-9\-_]{20,}/, label: 'PyPI Token' },
  { pattern: /nuget[A-Za-z0-9]{46}/, label: 'NuGet API Key' },

  // JWT
  { pattern: /eyJ[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]{20,}/, label: 'JWT Token' },

  // Generic secret assignments (code and config)
  { pattern: /(password|secret|token|api_key|apikey)\s*[:=]\s*['"][^'"]{8,}/, label: 'Generic Secret Assignment' },

  // Authorization headers
  { pattern: /[Aa]uthorization:\s*(Bearer|Basic|Token)\s+\S{8,}/, label: 'Authorization Header' },

  // Database connection strings
  { pattern: /\w+:\/\/[^:]+:[^@]+@[^/\s]+/, label: 'Database Connection String' },

  // CLI password/token flags (common in bash commands)
  { pattern: /--password[= ]\S+/, label: 'CLI Password Flag' },
  { pattern: /--token[= ]\S+/, label: 'CLI Token Flag' },
  { pattern: /-p[A-Za-z0-9!@#$%^&*]{6,}/, label: 'MySQL-style Password Flag' },

  // Environment variable exports with secrets
  { pattern: /export\s+(PASSWORD|SECRET|TOKEN|API_KEY|APIKEY|AWS_SECRET)[= ]\S+/i, label: 'Environment Secret Export' },
];

module.exports = { SECRET_PATTERNS };
