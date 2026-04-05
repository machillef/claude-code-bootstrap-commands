# Gotcha: Pipeline Round-Trip Testing

## When this applies

When a slice implements one component of a multi-step data pipeline (e.g., hook A writes data that hook B reads).

## The failure mode

Step 9 (re-assessment) marks the slice Complete after verifying the individual component works. But the component's output format may not match what downstream consumers expect. The critical .json/.yaml bug in the learning pipeline was exactly this — the observer wrote .yaml files but the nudge filtered for .json files.

## Prevention

After implementing a pipeline component, verify the round-trip:
1. Create a test input
2. Run the producer (write)
3. Run the consumer (read)
4. Verify the consumer successfully processes the producer's output

Include adversarial inputs: quotes, newlines, unicode, empty strings.

## Source

learning-system-completion retro, 2026-04-05. The .json/.yaml mismatch was only caught by dogfooding, not by any of the 3 code review passes.
