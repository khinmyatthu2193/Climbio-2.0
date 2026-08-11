# Climbio Frontend Guidelines


## Frontend Stack

Framework:
- React + TypeScript

Build:
- Vite

Styling:
- Tailwind CSS

State:
- Zustand

Server Data:
- React Query


## UI/UX Principles

Climbio should feel like:

- Modern SaaS application
- Professional business software
- Clean and simple
- Mobile friendly


Design goals:

- Good spacing
- Clear hierarchy
- Consistent components
- Fast interaction


## UI Rules

When modifying UI:

DO NOT:

- Change business logic.
- Remove existing API calls.
- Break routes.
- Duplicate components.


Always:

- Reuse existing components.
- Keep responsive design.
- Add loading states.
- Add empty states.
- Handle errors clearly.


## Component Rules

Prefer:

components/

for reusable UI.


Example:

Button
Card
Modal
Input
Table
Badge


Avoid:

Large components with everything inside.


## API Rules

API URLs must come from:

import.meta.env.VITE_API_URL


Never use:

localhost URLs.


## Authentication

Authentication uses:

- JWT access token
- Refresh token

Protected routes must remain protected.


## Public Store

Public store:

Route:

/shop/:slug


Rules:

- No authentication required.
- Customer can view products.
- Only active products appear.


## Before completing frontend tasks

Run:

npm run build

Fix all TypeScript errors.