import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }

    next();
  };
};