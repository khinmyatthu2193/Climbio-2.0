# Climbio Project Development Guidelines

## Project Overview

Climbio is a SaaS shop management and inventory management platform.

The application helps small businesses manage:

- Products
- Inventory
- Sales
- Invoices
- Shop profile
- Public product catalog
- Business reports


## Project Architecture

Climbio uses a monorepo structure.


Frontend:

Technology:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Zustand

Location:

/frontend


Backend:

Technology:
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase

Location:

/backend


Database:

- PostgreSQL
- Supabase hosted


Deployment:

Frontend:
- Vercel

Backend:
- Render

Database:
- Supabase


# General Rules

## Before modifying code

Always:

1. Analyze existing implementation.
2. Understand current data flow.
3. Reuse existing components/functions.
4. Avoid unnecessary changes.


## Important Restrictions

DO NOT:

- Rewrite existing architecture without approval.
- Remove existing features.
- Change API endpoints without approval.
- Change database schema without migration.
- Break authentication flow.
- Hardcode localhost URLs.
- Commit secrets or environment variables.


## Production Safety

This project is deployed.

Any changes must:

- Keep existing functionality working.
- Maintain backward compatibility.
- Pass build checks before completion.


## Coding Standards

Use:

- Clean TypeScript
- Meaningful variable names
- Reusable components
- Proper error handling
- Clear folder structure


## Before finishing tasks

Always:

1. Check changed files.
2. Run TypeScript validation.
3. Run build.
4. Report possible impacts.