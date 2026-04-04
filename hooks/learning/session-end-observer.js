#!/usr/bin/env node
/**
 * session-end-observer.js — Stop ASYNC hook
 *
 * Reads recent observations from the current project's observations.jsonl
 * (last 50 entries). If fewer than the configured minimum (default 20),
 * no-op. Otherwise, outputs a JSON summary of patterns detected for the
 * ambient-learning-nudge to pick up next session.
 *
 * Writes to ~/.claude/arc/projects/<hash>/last-observer-summary.json.
 * Graceful no-op if the observations directory does not exist.
 *
 * Exit codes:
 *   0 = always (async, best-effort)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getProjectId, getProjectDir } = require('../lib/project-id');

const MIN_OBSERVATIONS = 20;
const TAIL_COUNT = 50;

// getProjectId and getProjectDir imported from shared module (see require at top)

function readTailLines(filePath, count) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.slice(-count);
  } catch {
    return [];
  }
}

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
      } catch {
        // Skip malformed lines
      }
    }

    if (observations.length < MIN_OBSERVATIONS) {
      process.exit(0);
    }

    // Analyze patterns
    const toolCounts = {};
    const eventCounts = { pre: 0, post: 0 };
    const summaryPatterns = {};

    for (const obs of observations) {
      const tool = obs.tool || 'unknown';
      toolCounts[tool] = (toolCounts[tool] || 0) + 1;

      const event = obs.event || 'unknown';
      if (event in eventCounts) {
        eventCounts[event]++;
      }

      // Extract first word of summary as a pattern
      const firstWord = (obs.summary || '').split(':')[0].trim();
      if (firstWord) {
        summaryPatterns[firstWord] = (summaryPatterns[firstWord] || 0) + 1;
      }
    }

    // Sort tools by frequency
    const topTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, count }));

    const summary = {
      generated_at: new Date().toISOString(),
      project_id: projectId,
      observation_count: observations.length,
      top_tools: topTools,
      event_distribution: eventCounts,
      session: String(process.ppid),
    };

    const summaryPath = path.join(projectDir, 'last-observer-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');
  } catch {
    // Silent failure — best-effort
  }
  process.exit(0);
});
