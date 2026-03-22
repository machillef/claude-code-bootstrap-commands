# Gotcha: C1853 PCH Compiler Mismatch After Domain Header Change

**Source:** Extracted from FileScout ui-ux-polish slice U3 (2026-03-21)

Changing a widely-included domain header (e.g. `ExplorerCommand.h` included via
`pch.h`) causes a stale PCH that MSBuild reports as `error C1853: precompiled
header file is from a different version of the compiler`. This is misleading —
the real cause is that the PCH timestamp is out of date relative to the changed
header.

## The Pattern

1. Edit a domain `.h` file that is indirectly included by `pch.h`
2. Run incremental MSBuild
3. MSBuild tries to reuse the old PCH but it was compiled without the header change
4. `C1853` fires on every `.cpp` that uses the PCH

## Rule

After any edit to a header that is directly or indirectly included by `pch.h`,
delete the PCH obj directories before rebuilding:

```bash
rm -rf native/FileScout.Native/obj/x64/Debug
rm -rf native/FileScout.Tests/obj/x64/Debug
```

Then rebuild normally. The PCH will be regenerated from scratch.

## Note

Deleting only the `.pch` file is insufficient; the companion `.obj` is also stale
and must be removed. Deleting the full `obj/x64/Debug` directory is the safest
and fastest path.
