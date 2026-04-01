import { ZodError } from "zod";

export const validate = (schema, data, res) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    res.status(400).json({ message: "Validation failed", errors });
    return null;
  }
  return result.data;
};

export const isZodError = (err) => err instanceof ZodError;
