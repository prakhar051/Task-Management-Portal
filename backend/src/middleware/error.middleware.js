import { ZodError } from 'zod';

// Handles unmatched route lookups
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource path '${req.originalUrl}' not found on this server.`,
    errors: []
  });
};

// Global Express handler formatting errors into the standard API Response schema
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Parse Zod schema validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation verification checks failed.';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  // Handle Prisma ORM target record constraints
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Integrity constraint violation occurred.';
    const fields = err.meta?.target || [];
    errors = fields.map((f) => ({
      field: f,
      message: `The value for field '${f}' is already registered.`
    }));
  }

  // Return standard response structure
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined
  });
};
