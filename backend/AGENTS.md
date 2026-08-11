# Climbio Backend Guidelines


## Backend Stack

Runtime:

Node.js


Framework:

Express


Language:

TypeScript


Database:

PostgreSQL


ORM:

Prisma


Storage:

Supabase Storage


## API Rules

Before changing API:

Check:

- Existing routes
- Controllers
- Services
- Frontend usage


DO NOT:

- Rename endpoints.
- Remove existing responses.
- Change response format without approval.


## Authentication

Authentication system:

JWT based.


Tokens:

Access token:
- Short lifetime


Refresh token:
- Long lifetime


Protected routes require authentication middleware.


## User Roles

Supported roles:

- Admin
- Manager
- Staff


Respect role permissions.


## Database Rules

Database changes require:

1. Update schema.prisma
2. Create migration
3. Test locally
4. Deploy migration


Never manually modify production database.


## Prisma

Development:

prisma migrate dev


Production:

prisma migrate deploy


## Error Handling

Always:

- Validate input.
- Return meaningful errors.
- Avoid exposing secrets.


## Environment Variables

Never hardcode:

DATABASE_URL
JWT secrets
Supabase keys


Use:

process.env


## Before completing backend tasks

Run:

npm run build

Verify:

- TypeScript
- Prisma
- API compatibility