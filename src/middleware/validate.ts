import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { error } from "../utils/apiResponse";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: { message: "Validation failed", details },
        });
        return;
      }
      next(err);
    }
  };
}
