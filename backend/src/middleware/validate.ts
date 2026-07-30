import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export const validateBody = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(422).json({ error: 'Validation failed', details: result.error.flatten().fieldErrors });
    req.body = result.data;
    next();
  };
