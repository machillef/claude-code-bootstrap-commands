'use strict';

/**
 * Shared secret detection patterns used by safety hooks and observation capture.
 * Each entry has a `pattern` (RegExp) and a `label` (human-readable description).
 */
const SECRET_PATTERNS = [
  { pattern: /AKIA[0-9A-Z]{16}/, label: 'AWS Access Key' },
  { pattern: /ghp_[A-Za-z0-9_]{36,}/, label: 'GitHub Personal Access Token' },
  { pattern: /gho_[A-Za-z0-9_]{36,}/, label: 'GitHub OAuth Token' },
  { pattern: /ghs_[A-Za-z0-9_]{36,}/, label: 'GitHub Server Token' },
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/, label: 'GitHub Fine-Grained PAT' },
  { pattern: /-----BEGIN.*PRIVATE KEY-----/, label: 'Private Key' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/, label: 'OpenAI API Key' },
  { pattern: /sk-ant-[A-Za-z0-9\-_]{20,}/, label: 'Anthropic API Key' },
  { pattern: /(password|secret|token|api_key|apikey)\s*[:=]\s*['"][^'"]{8,}/, label: 'Generic Secret Assignment' },
  { pattern: /xox[bpsa]-[A-Za-z0-9-]+/, label: 'Slack Token' },
  { pattern: /sk_live_[A-Za-z0-9]+/, label: 'Stripe Secret Key' },
  { pattern: /rk_live_[A-Za-z0-9]+/, label: 'Stripe Restricted Key' },
  { pattern: /npm_[A-Za-z0-9]{36}/, label: 'npm Token' },
  { pattern: /eyJ[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]{20,}/, label: 'JWT Token' },
];

module.exports = { SECRET_PATTERNS };
