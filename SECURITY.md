# Security Notes

HerWayCabs is a portfolio / educational project. This document is an honest account of what is protected, what isn't yet, and how it would be hardened for production.

## What's in place

- **Password storage** — user passwords are hashed with **BCrypt**; hashes are never returned by any API (admin listings use a DTO without the password field).
- **JWT authentication** — the auth-service issues stateless HS256 JWTs; a filter validates the token on protected routes. Tokens are attached by the SPA via an Axios interceptor.
- **Women-only sign-up** — registration rejects a missing/non-`Female` gender, and **ADMIN accounts cannot be created through public sign-up**.
- **Driver gate** — a driver must be **admin-verified** before going online; KYC documents are reviewed by an admin.
- **Admin console** — ASP.NET cookie authentication, **ADMIN-only** (`[Authorize]` + role check), antiforgery tokens on state-changing POSTs, and baseline **security headers** (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`). It trusts `X-Forwarded-*` only from Render's proxy.
- **Transport** — everything is served over HTTPS (Render / Vercel terminate TLS).
- **Durable documents** — driver and KYC document bytes are stored in the database (not the ephemeral container disk) and are `@JsonIgnore`d so they never leak into JSON list responses.
- **Resilience** — Feign inter-service calls have connect/read timeouts so a cold or unreachable service fails fast; cross-service side effects (driver sync, on-trip flips) are best-effort and never break the ride flow. API errors return proper status codes (400/404/409) instead of raw 500s.

## Known limitations (by design, for the demo)

- **Some read endpoints are public.** The admin console calls `/api/auth/users`, `/api/drivers`, `/api/bookings/all`, and `/api/kyc/*` server-to-server without a service token, so these are currently reachable without authentication. Riders/drivers also read `/api/drivers/{id}` directly. No sensitive secrets are exposed (no password hashes, no document bytes in JSON), but the listings are not access-controlled.
- **Payments are simulated** — there is no real payment provider; "Pay" simply advances the ride state and is labeled as a demo in the UI.
- **Admin session** — DataProtection keys are ephemeral, so admins must sign in again after a cold start. Keep-alive mitigates the frequency.
- **Third-party demo services** — location autocomplete (Nominatim) and route preview (OSRM) use free public endpoints suitable for demo traffic only.
- **Free-tier exposure** — the database credentials were shared in plaintext during initial setup; for any real use they must be rotated and moved to a secrets manager.

## Hardening roadmap

1. **Service-to-service auth** — require a shared internal key (or gateway-issued token) on the admin/data endpoints; make it env-gated so it can be enabled without downtime.
2. **Rate limiting** at the gateway (per-IP / per-user) and **circuit breakers** on Feign.
3. **Persist admin DataProtection keys** to the database so sessions survive restarts.
4. **Object storage** (S3/MinIO/Cloudinary) for documents instead of DB bytes at scale.
5. **Secrets management** and credential rotation (DB, JWT secret).
6. **Bean Validation** (`@Valid`) on all write DTOs and a shared error contract across services.

## Reporting

This is a demo project with seeded test accounts. If you find an issue, open a GitHub issue — please do not include real personal data.
