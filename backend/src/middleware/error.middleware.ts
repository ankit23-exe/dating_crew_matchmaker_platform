import type { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(500).json({ message: err.message || "Internal Server Error" });
};
