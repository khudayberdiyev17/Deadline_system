# NIS Assignment Management Microservice

A self-contained FastAPI, PostgreSQL and React service for managing school assignments.

## Start

1. Copy `.env.example` to `.env`, replace `POSTGRES_PASSWORD`, `JWT_SECRET`, and the initial administrator password.
2. Run:

```bash
docker compose up --build
```

The web application is at http://localhost:4422. Swagger/OpenAPI is at http://localhost:4444/docs and the health endpoint is http://localhost:4444/health.

## Production server (Ubuntu/Debian)

Install Docker Engine and the Docker Compose plugin, then upload or clone only the repository source (do not copy `frontend/node_modules`, `frontend/dist`, Python `__pycache__`, `.git`, or `.worktrees`). From the repository root:

```bash
cp .env.example .env
nano .env
docker compose up -d --build
docker compose ps
curl -f http://localhost:4444/health
```

Before the first start, set strong unique values for `POSTGRES_PASSWORD`, `JWT_SECRET`, and `INITIAL_ADMIN_PASSWORD`. Set `DATABASE_URL` to the same database name as `POSTGRES_DB`. For a public domain, replace the localhost values in `CORS_ORIGINS` with the exact HTTPS origin, for example `https://nis.example.uz`, and place an HTTPS reverse proxy in front of port `4422`. Keep the backend port `4444` private with your firewall or reverse proxy.

Useful operations:

```bash
docker compose logs -f --tail=100
docker compose pull && docker compose up -d --build
docker compose exec backend alembic current
```

On the first backend start, the account named by `INITIAL_ADMIN_USERNAME` is created from the environment. It is idempotent; remove the bootstrap values after provisioning if preferred.

## Administration workflow

Create active classes and subjects using the administrator API, then students can register and receive sequential IDs from `nis@001` through `nis@999`. Administrator API endpoints are documented in Swagger and support class/subject creation and activation, student listing, assignments targeted to a class or one student, recipient monitoring, and protected downloads.

## Migrations and tests

Compose runs migrations automatically. To run them manually:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend pytest
```

The initial migration is deliberately the sole schema authority; production startup does not call SQLAlchemy `create_all`.

## Design notes

- Assignment recipients are materialized at publication time.
- Deadline state is derived from the server clock and submission operations reject at or after the deadline.
- Uploads use UUID storage keys in the persistent `uploads` Docker volume. Allowed types and size limit are configurable in `.env`.
- JWT bearer tokens are used for this lightweight MVP. A future central identity provider can replace the authentication boundary without changing the domain models.
- The concise frontend provides live student registration/login, countdowns, assignments, uploads, and an administrator overview. Administrative CRUD endpoints are API-complete; broader form screens are a straightforward next UI increment.

