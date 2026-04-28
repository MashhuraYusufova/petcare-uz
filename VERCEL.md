# Vercel setup

Deploy this repository as two separate Vercel projects from the same Git repo:

1. Frontend project
Set the Root Directory to `frontend`.

2. Backend project
Set the Root Directory to `backend`.

Vercel supports monorepos, so both connected projects will deploy from the same repository on each push.

## Backend env vars

- `DATABASE_URL`: MongoDB connection string for Prisma
- `JWT_SECRET`: JWT signing secret

The backend now allows all origins through CORS.

## Frontend env vars

Use one of these options:

1. Recommended: same-origin `/api` proxy
- `API_URL=https://your-backend-project.vercel.app`

In this mode, the frontend calls `/api/*` on its own domain and Next.js rewrites those requests to the backend.

2. Direct browser calls to backend
- `NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app`

In this mode, the browser calls the backend domain directly.

## Notes

- Local development still uses `http://localhost:3001` when no Vercel API env vars are set.
- Backend health check is available at `/api/health`.
