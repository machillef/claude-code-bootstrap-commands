# Gotcha: Scan for Runtime String References After Deletion

**Source:** Extracted from real session failure (2026-03-13)

When deleting code during cleanup, the build succeeds but runtime breaks because removed entities are referenced via strings — URL routes, error handlers, config values.

## Real Example

Deleting `HomeController.cs` left `app.UseExceptionHandler("/Home/Error")` in `Program.cs`. Build passed. Every server-side exception cascaded into a second failure at runtime.

## Rule

After ANY deletion of controllers, views, services, or modules, grep the entire project for string references before committing:

```bash
rg -i "<deleted-entity-name>" --glob '!**/bin/**' --glob '!**/obj/**'
```

Check especially: Program.cs/Startup.cs (error handlers, routes), appsettings.json, Dockerfiles, CI workflows.
