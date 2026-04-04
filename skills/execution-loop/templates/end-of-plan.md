---
## End of Plan

All slices are complete.

### Definition of Done
<for each criterion from scope-map.md:>
- [x] <criterion> — MET: <evidence>
- [ ] <criterion> — NOT MET: <what's missing>

### Remaining Validation
<if all DoD criteria are met, write "All exit criteria met." and skip the slice-level detail below>

**Slice N — <name>**
- <copy "What remains unverified" text verbatim>
- <any unverified exit criterion from slices.md>

(Omit slices where everything was verified.)

### Next Step
<if all DoD criteria are met:>
Initiative is complete. The arc learning system captures patterns automatically via observation hooks.
<if any DoD criterion is NOT MET:>
If unmet criteria are bugs in completed slices: Run `/fix <initiative>` to address them.
If unmet criteria require new work or re-design: Run `/new-feature <initiative>-fixes`.
---
