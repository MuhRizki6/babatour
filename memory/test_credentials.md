# Test Credentials

## Admin Account
- **Email**: `admin@babatour.com`
- **Password**: `BabaTour2026!`
- **Role**: admin

## Auth Endpoints
- `POST /api/auth/login` — Returns `{ token, user }`
- `GET /api/auth/me` — Returns current admin (requires `Authorization: Bearer <token>`)

## Admin Endpoints (all require Bearer token)
- `GET /api/admin/inquiries` — List inquiries
- `PATCH /api/admin/inquiries/{id}` — Update status (new|contacted|converted|closed)
- `DELETE /api/admin/inquiries/{id}` — Delete inquiry
- `GET /api/admin/blog` — List all blog posts
- `POST /api/admin/blog` — Create post
- `PATCH /api/admin/blog/{id}` — Update post
- `DELETE /api/admin/blog/{id}` — Delete post
- `GET /api/admin/stats` — Dashboard stats

## Frontend Routes
- `/admin/login` — Login page
- `/admin` — Dashboard (inquiries list + stats)
- `/admin/blog` — Manage blog
- `/admin/blog/new` — Create post
- `/admin/blog/:id/edit` — Edit post
- `/packages/:id` — Public package detail page
- `/blog` — Public blog list
- `/blog/:slug` — Public blog detail
