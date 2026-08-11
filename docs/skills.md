# Climbio Business Knowledge


## Product Management

A product contains:

- Product name
- Description
- Category
- Price
- Quantity
- Image
- Active status


Inventory rules:

quantity = 0

means:

Out of Stock


Inactive products:

- Hidden from public catalog.


## Public Product Catalog

Purpose:

Allow customers to view shop products without login.


URL:

/shop/:slug


Customer:

No account required.


Features:

- Shop branding
- Product list
- Search
- Category filter
- Product detail
- Contact seller


## Shop

Each shop has:

- Shop name
- Public slug
- Logo
- Phone
- Address
- Products


Public slug:

Example:

/shop/my-shop-name


## Authentication

Users:

- Register
- Login
- Logout
- Profile management


User information:

- Name
- Email
- Password
- Shop information
- Role


## Inventory Workflow


Shop owner:

Create product

↓

Product appears in inventory

↓

Customer can view active products

↓

Stock updates when quantity changes


## Future AI Features

Possible AI integrations:

1. Product description generator

2. Sales summary assistant

3. Inventory prediction

4. Business insights

5. Customer support assistant


AI features must not break existing business logic.