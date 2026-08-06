# Climbio 2.0 - Project Status

**Last reviewed:** 6 August 2026
**Status:** Core product and the shop-approval/admin workflow are implemented in the codebase. Both frontend and backend production builds currently pass.

This is the single reference for what Climbio has today. "Implemented" means the feature has a frontend route and/or backend API in the repository; it does not by itself confirm that the deployed environment, database migrations, or third-party credentials have been tested.

## Where we are now

Climbio is at a **feature-complete MVP / pre-release verification** stage for a small-business shop-management SaaS. A shop owner can register, be reviewed by an administrator, manage a catalog and inventory, create and track invoices, share a public shop page, view business metrics, and use AI-based business advice.

The main work remaining is end-to-end testing with real services and data, deployment verification, and release polish - not the primary product flows.

## Implemented features

### Accounts, security, and access

- Registration and sign-in for shop owners.
- JWT access tokens, rotating refresh tokens in HTTP-only cookies, hashed passwords, logout, and password change.
- Profile, shop, address, currency, invoice-footer, and logo settings.
- Role and access controls for `ADMIN`, `SHOP_OWNER`, `MANAGER`, and `STAFF`.
- Protected business modules: unapproved shops can sign in and manage their application, but cannot access operational features.
- Request validation, secure response headers, CORS allowlist, compression, API rate limiting, and centralized error handling.
- Idempotent bootstrap script for the private platform-admin account.

### Shop application and administration

- New shop-owner registrations begin with a pending application.
- Shop owners can view, edit, and resubmit their application.
- Admin dashboard, applications queue, application detail view, shop list, user list, and audit-log view.
- Admin actions: approve, request changes, decline, suspend, reactivate, give general feedback, and reopen an application.
- Review history is stored, including feedback, prior/next status, reviewer, application version, and timestamps.

### Product and inventory management

- Create, edit, view, search, filter, sort, and delete products.
- Product name, description, sale price, cost price, stock quantity, category, active state, and image support.
- Product categories can be created and deleted.
- Image upload pipeline using server-side storage integration.
- Inventory summaries and low-stock / out-of-stock indicators.

### Invoices and sales

- Create invoices from catalog products with customer name, optional phone number, quantities, and discounts.
- Invoice list and detail views, search/filter/sort controls, and delete action.
- Status workflow: Draft, Sent, Paid, Overdue, and Cancelled.
- Invoice PDF generation and download.
- Product stock is integrated with invoice workflow; invoice data is tenant-scoped.

### Dashboard and reporting

- Shop dashboard with product count, stock on hand, low-stock count, paid-invoice revenue, product-stock ranking, and sales charts.
- Sales chart ranges: last 7 days, 30 days, and 6 months.
- Revenue metrics are calculated from paid invoices.
- Financial report download from the dashboard in PDF and Excel-compatible `.xls` formats, using the selected reporting range. Reports include paid revenue, sales breakdown, and inventory snapshot.

### Public store

- A shareable public shop route: `/shop/:slug`.
- Public catalog shows active products only.
- Shop owners can configure the shop slug, name, phone, address, and whether the public store is enabled.
- My Store management view and QR-code capability for sharing.

### AI advisor

- Server-side AI analysis of sales, product, inventory, and customer records using OpenRouter.
- AI business analysis endpoint and saved insights.
- AI chat with history for business-specific questions.
- API key remains server-side; it is not exposed to the frontend bundle.

### Experience and platform

- Responsive React/Vite interface with light and dark themes.
- English/Burmese language toggle with a local dictionary-based translation layer.
- Reusable UI, loading, empty-state, status, and image-cropping components.
- PostgreSQL/Prisma schema and migrations for all current core domains.
- Deployment configuration for Docker, Vercel frontend hosting, and a provider-neutral Node backend (documented for Render/Railway with Supabase database and storage).

## Main user journeys available

1. Shop owner registers -> completes/edits application -> waits for admin review.
2. Admin approves the application -> shop owner gains access to the business workspace.
3. Shop owner adds categories and products -> manages stock and product images.
4. Shop owner creates invoices -> updates payment status -> downloads PDFs.
5. Dashboard uses paid invoices and inventory to show sales and stock health.
6. Shop owner enables and shares a public shop page.
7. Shop owner asks the AI Advisor for analysis or data-based answers.

## Current technical state

| Area | Current state |
| --- | --- |
| Frontend | React + TypeScript + Vite + Tailwind; build passes (6 Aug 2026). |
| Backend | Express + TypeScript + Prisma; build passes (6 Aug 2026). |
| Database | PostgreSQL schema and migrations are present for auth, inventory, invoices, public shops, AI, and approval workflow. |
| Storage | Supabase Storage integration is implemented; credentials and live upload verification are environment-dependent. |
| AI | OpenRouter integration is implemented; requires a valid server API key and live-service testing. |
| Deployment | Deployment configuration and instructions exist; live deployment health has not been verified in this review. |
| Automated tests | No dedicated unit, integration, or end-to-end test suite was found. |

## Release checklist / next priorities

- [ ] Run a full manual end-to-end test: registration, admin approval, products, invoice payment, stock changes, public store, PDF, and AI chat.
- [ ] Confirm production environment variables, CORS origins, Supabase Storage permissions, OpenRouter key, and database migrations.
- [ ] Verify the deployed frontend, API health endpoint, refresh-cookie authentication, uploads, and public-shop routing.
- [ ] Add automated tests for authentication, authorization/approval gates, invoices/stock changes, and admin actions.
- [ ] Review the production bundle size: the current frontend build warns that the main bundle and PDF dependency chunks exceed the recommended 500 kB threshold; introduce further route/vendor code-splitting if needed.
- [ ] Decide the next product scope after MVP validation (for example: dedicated customer management, richer financial reports, notifications, payment integrations, staff permissions, or audit exports).

## How to keep this document current

After each meaningful change, update:

1. **Implemented features** when a user-facing flow is complete.
2. **Current technical state** when a build, deployment, integration, or test result changes.
3. **Release checklist** by moving completed checks to the implemented section or marking them done.
