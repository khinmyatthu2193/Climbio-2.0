-- PostgreSQL requires a committed enum addition before it can be used as a column default.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SHOP_OWNER';
