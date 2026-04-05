#!/usr/bin/env node
/**
 * session-end-observer.js — Stop ASYNC hook
 *
 * Reads recent observations from the current project's observations.jsonl.
 * Detects patterns and creates/updates instinct YAML files.
 * Also writes a summary for the ambient-learning-nudge.
 *
 * Pattern detection heuristics:
 * 1. Repeated tool patterns — same tool used 5+ times on similar targets
 * 2. Error-recovery pairs — failed tool call followed by successful alternative
 *
 * Exit codes:
 *   0 = always (async, best-effort)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getProjectId, getProjectDir } = require('../lib/project-id');

const MIN_OBSERVATIONS = 20;
const TAIL_COUNT = 50;
const TOOL_REPEAT_THRESHOLD = 5;
const NEW_INSTINCT_CONFIDENCE = 0.3;
const CONFIDENCE_BUMP = 0.1;
const MAX_CONFIDENCE = 0.9;

function readTailLines(filePath, count) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.slice(-count);
  } catch {
    return [];
  }
}

function getProjectName() {
  const { spawnSync } = require('child_process');
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status === 0 && result.stdout) {
    return path.basename(result.stdout.trim());
  }
  return path.basename(process.cwd());
}

/**
 * Detect repeated tool usage patterns.
 * If a tool is used 5+ times in a session, that's a tooling pattern.
 */
function detectToolPatterns(observations) {
  const toolCounts = {};
  for (const obs of observations) {
    const tool = obs.tool || 'unknown';
    const summary = (obs.summary || '').split(':')[0].trim();
    const key = `${tool}:${summary}`;
    toolCounts[key] = (toolCounts[key] || 0) + 1;
  }

  const patterns = [];
  for (const [key, count] of Object.entries(toolCounts)) {
    if (count >= TOOL_REPEAT_THRESHOLD) {
      const [tool, context] = key.split(':');
      patterns.push({
        type: 'tool-pattern',
        trigger: `When working with ${context || tool} operations`,
        action: `The ${tool} tool was used frequently (${count} times). This is a common workflow pattern for this project.`,
        domain: 'tooling',
        evidence: `Observed ${count} uses of ${tool} for "${context}" in a single session`,
      });
    }
  }
  return patterns;
}

/**
 * Detect error-recovery pairs.
 * A "post" event with an error-like summary followed by a different approach.
 */
function detectErrorRecoveryPatterns(observations) {
  const patterns = [];
  for (let i = 0; i < observations.length - 1; i++) {
    const current = observations[i];
    const next = observations[i + 1];

    const currentSummary = (current.summary || '').toLowerCase();
    const isError = currentSummary.includes('error') ||
                    currentSummary.includes('fail') ||
                    currentSummary.includes('denied') ||
                    currentSummary.includes('blocked');

    if (isError && next.tool !== current.tool) {
      patterns.push({
        type: 'error-recovery',
        trigger: `When ${current.tool} fails with "${current.summary}"`,
        action: `Switch to ${next.tool} as an alternative approach.`,
        domain: 'debugging',
        evidence: `Observed ${current.tool} failure followed by successful ${next.tool} in session`,
      });
    }
  }
  return patterns;
}

/**
 * Generate a stable kebab-case ID for an instinct based on its trigger.
 */
function generateInstinctId(trigger) {
  const hash = crypto.createHash('sha256').update(trigger).digest('hex').slice(0, 8);
  const slug = trigger
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${slug}-${hash}`;
}

/**
 * Load existing instincts from the instincts directory.
 */
function loadExistingInstincts(instinctsDir) {
  const instincts = {};
  if (!fs.existsSync(instinctsDir)) return instincts;

  try {
    const files = fs.readdirSync(instinctsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(instinctsDir, file), 'utf8');
        // Simple YAML frontmatter parsing — extract trigger and confidence
        const triggerMatch = content.match(/^trigger:\s*"(.+)"/m);
        const confidenceMatch = content.match(/^confidence:\s*([\d.]+)/m);
        const observationsMatch = content.match(/^observations:\s*(\d+)/m);
        if (triggerMatch) {
          instincts[file] = {
            trigger: triggerMatch[1],
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : NEW_INSTINCT_CONFIDENCE,
            observations: observationsMatch ? parseInt(observationsMatch[1], 10) : 1,
            path: path.join(instinctsDir, file),
          };
        }
      } catch { /* skip unreadable files */ }
    }
  } catch { /* directory unreadable */ }

  return instincts;
}

/**
 * Check if a detected pattern matches an existing instinct (by trigger substring).
 */
function findMatchingInstinct(pattern, existing) {
  const patternWords = pattern.trigger.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  for (const [file, instinct] of Object.entries(existing)) {
    const instinctLower = instinct.trigger.toLowerCase();
    const matchCount = patternWords.filter(w => instinctLower.includes(w)).length;
    if (matchCount >= patternWords.length * 0.5) {
      return { file, ...instinct };
    }
  }
  return null;
}

/**
 * Bump confidence of an existing instinct.
 */
function bumpInstinct(instinctPath, currentConfidence, currentObservations) {
  try {
    let content = fs.readFileSync(instinctPath, 'utf8');
    const newConfidence = Math.min(currentConfidence + CONFIDENCE_BUMP, MAX_CONFIDENCE);
    const newObservations = currentObservations + 1;
    const now = new Date().toISOString();

    content = content.replace(/^confidence:\s*[\d.]+/m, `confidence: ${newConfidence}`);
    content = content.replace(/^last_seen:\s*".+"/m, `last_seen: "${now}"`);
    content = content.replace(/^observations:\s*\d+/m, `observations: ${newObservations}`);

    fs.writeFileSync(instinctPath, content);
    try { fs.chmodSync(instinctPath, 0o600); } catch {}
  } catch { /* best-effort */ }
}

/**
 * Create a new instinct YAML file.
 */
function createInstinct(pattern, projectId, projectName, instinctsDir) {
  const id = generateInstinctId(pattern.trigger);
  const now = new Date().toISOString();

  const content = `---
id: "${id}"
trigger: "${pattern.trigger}"
action: "${pattern.action}"
confidence: ${NEW_INSTINCT_CONFIDENCE}
domain: "${pattern.domain}"
source: "session-observation"
scope: "project"
project_id: "${projectId}"
project_name: "${projectName}"
created: "${now}"
last_seen: "${now}"
observations: 1
---

# ${pattern.trigger}

## Trigger
${pattern.trigger}

## Action
${pattern.action}

## Evidence
- ${pattern.evidence}
`;

  const filePath = path.join(instinctsDir, `${id}.yaml`);
  fs.mkdirSync(instinctsDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(filePath, content);
  try { fs.chmodSync(filePath, 0o600); } catch {}
}

// --- Main ---

let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  try {
    const projectId = getProjectId();
    const projectDir = getProjectDir(projectId);
    const obsFile = path.join(projectDir, 'observations.jsonl');

    if (!fs.existsSync(obsFile)) {
      process.exit(0);
    }

    const lines = readTailLines(obsFile, TAIL_COUNT);
    if (lines.length < MIN_OBSERVATIONS) {
      process.exit(0);
    }

    // Parse observations
    const observations = [];
    for (const line of lines) {
      try {
        observations.push(JSON.parse(line));
      } catch { /* skip malformed */ }
    }

    if (observations.length < MIN_OBSERVATIONS) {
      process.exit(0);
    }

    // Detect patterns
    const toolPatterns = detectToolPatterns(observations);
    const errorPatterns = detectErrorRecoveryPatterns(observations);
    const allPatterns = [...toolPatterns, ...errorPatterns];

    // Load existing instincts
    const instinctsDir = path.join(projectDir, 'instincts');
    const existing = loadExistingInstincts(instinctsDir);
    const projectName = getProjectName();

    let created = 0;
    let bumped = 0;

    // Create or bump instincts
    for (const pattern of allPatterns) {
      const match = findMatchingInstinct(pattern, existing);
      if (match) {
        bumpInstinct(match.path, match.confidence, match.observations);
        bumped++;
      } else {
        createInstinct(pattern, projectId, projectName, instinctsDir);
        created++;
      }
    }

    // Write summary (for ambient-learning-nudge)
    const topTools = Object.entries(
      observations.reduce((acc, o) => {
        const t = o.tool || 'unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, count }));

    const summary = {
      generated_at: new Date().toISOString(),
      project_id: projectId,
      observation_count: observations.length,
      patterns_detected: allPatterns.length,
      instincts_created: created,
      instincts_bumped: bumped,
      top_tools: topTools,
      session: String(process.ppid),
    };

    const summaryPath = path.join(projectDir, 'last-observer-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
    try { fs.chmodSync(summaryPath, 0o600); } catch {}
  } catch {
    // Silent failure — best-effort
  }
  process.exit(0);
});
