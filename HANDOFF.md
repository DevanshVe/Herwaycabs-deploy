# HerWayCabs — Project Handoff

Quick-start context for picking this project up on a new machine, a new session, or by a teammate.

## What it is
A **women-only cab-booking platform**: Spring Boot microservices + React (Vite) SPA + ASP.NET Core admin portal, deployed on **Render** (backend) and **Vercel** (frontend), with **Neon PostgreSQL** (one database per service).

## Live URLs
| What | URL |
|---|---|
| Rider / Driver app | https://herwaycabs-deploy.vercel.app |
| Admin console | https://herwaycabs-admin-portal.onrender.com |
| API gateway | https://herwaycabs-api-gateway.onrender.com |
| Eureka dashboard | https://herwaycabs-discovery.onrender.com |
| Per-service API docs | `<service-url>/swagger-ui.html` |

## Repo & how deployment works
- GitHub: **DevanshVe/Herwaycabs-deploy**, primary branch `main`.
- **Deploying = pushing to `main`.** Render auto-deploys each backend service (Docker) and Vercel auto-deploys the frontend on every push to `main`.
- Backend services on Render (free tier): `discovery`, `api-gateway`, `auth`, `booking`, `driver`, `payment`, `kyc`, `admin-portal`.
- Free-tier services sleep after ~15 min idle → cold starts. A GitHub Actions keep-alive (`.github/workflows/keep-alive.yml`) + an external cron (cron-job.org) ping them. Admin health check path: `/healthz`.

## Secrets — NOT in the repo
- **`CREDENTIALS.local.md`** (gitignored) holds the Neon DB credentials, per-service env vars, and test accounts. **It does not travel via git — preserve it separately.**
- Runtime config lives as **environment variables in the Render dashboard** per service: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `SPRING_PROFILES_ACTIVE=render`, `EUREKA_URL`, `FRONTEND_URL`. Frontend: `VITE_API_URL` on Vercel.
- Test accounts: `rider@test.com` / `driver@test.com` / `admin@test.com` (password in `CREDENTIALS.local.md`). A friendly demo guide + PDF also exist locally (gitignored).

## Current status (as of this handoff)
- **Core app is live on `main`** — full ride lifecycle, cab types, ratings, live tracking, route preview, location autocomplete, notifications, KYC upload + admin review, on-trip status, Swagger docs, security headers.
- **Women-safety Phase 1** — one-tap **SOS**, **Share-My-Ride** public tracking (`/track/:token`), **Trusted Contacts**, driver **verified badge + vehicle**, "reached safely?" check-in, and an admin **SOS Alerts** dashboard — is **built, all builds verified, and pushed on branch `feature/safety`**. It is **not yet merged**. To deploy it: **merge `feature/safety` → `main`** (one coordinated deploy). Safety is co-located inside `booking-service` under `/api/safety/*` (no new Render service/DB needed).

## Docs in the repo
- `README.md` — architecture (with mermaid diagrams), features, API table, running locally.
- `SECURITY.md` — security posture, demo limitations, hardening roadmap.

## Roadmap (not built)
- Safety **Phase 2**: real SMS/email to trusted contacts on SOS/share (Twilio/SendGrid), web push.
- Real payments (Razorpay), WebSockets real-time (replace polling), Redis, Flyway migrations, object storage, observability (Prometheus/Grafana/tracing).

## Building locally
- Backend: `mvn -q compile` in each `microservices/<service>` (Java 17, Maven, Spring Boot 3.2).
- Frontend: `cd frontend && npm install && npm run build`.
- Admin: `cd microservices/admin-portal && dotnet build -c Release` (.NET 8).
