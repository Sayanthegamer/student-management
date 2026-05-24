
# Sentinel Security Journal

## 2024-05-20 - [Information Exposure in Authentication Flow & Weak Password Length]
**Vulnerability:** The application previously exposed raw error messages (like database structure details or explicit connection errors) during user login and password reset directly to the UI using `err.message`. It also had weak password validation constraints with `minLength={6}`.
**Learning:** These practices can be exploited by an attacker using credential stuffing or brute-forcing since it would inform them of exactly what went wrong or how they can deduce backend structure. Short passwords reduce the entropy needed to bypass authentication, significantly aiding an attacker's dictionary or brute-force attack.
**Prevention:** Always provide generic, safe messages (e.g. "Invalid email or password", "Registration failed. Please try again.") through sanitized client logs + secure server-side telemetry. Detailed exception logging must be handled in the server-side telemetry/backend logging layer (not client console). Ensure a secure minimal length for passwords such as 8 or 12.
## 2024-05-24 - [CSP and Security Headers]
**Vulnerability:** Missing strict Content-Security-Policy and standard security headers, increasing risk of XSS and clickjacking.
**Learning:** Adding CSP globally in `vercel.json` handles server-side enforcement, while a fallback in `index.html` handles static situations. It's important to not use `unsafe-inline` for `script-src` to prevent XSS, and to ensure JSON structure remains valid when modifying config files like `vercel.json`.
**Prevention:** Enforce security headers consistently across server configuration and HTML. Always validate JSON structure after modification.

## 2024-05-20 - [Memory Leak] Prevent Blob memory leak

**Vulnerability:** Memory leak from unreleased blob URLs
**Learning:** In a single-page application (SPA), unreleased blob URLs using `URL.createObjectURL(blob)` can cause memory bloat over time.
**Prevention:** Always call `window.URL.revokeObjectURL(url)` after downloading a file generated with `URL.createObjectURL(blob)`.
## 2024-05-24 - [Migration Drift] Database state divergence
**Vulnerability:** Migration history divergence between local files and remote state due to manual database changes or uncommitted migration files.
**Learning:** This can break automated deployments or CI checks, as CI assumes the migration files present locally reflect the current state of the remote database. If a migration is recorded in `supabase_migrations.schema_migrations` but no corresponding file exists in `supabase/migrations`, tools will flag a mismatch.
**Prevention:** Always ensure any schema modification in production or remote environments is backed by a corresponding timestamped migration file in the source repository.
