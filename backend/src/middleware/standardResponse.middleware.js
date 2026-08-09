import crypto from 'crypto';

export const standardResponse = (req, res, next) => {
  // Extract or generate IDs
  const requestId = req.headers['x-request-id'] || `req_${crypto.randomBytes(6).toString('hex')}`;
  const correlationId = req.headers['x-correlation-id'] || req.headers['correlation-id'] || `corr_${crypto.randomBytes(8).toString('hex')}`;

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Correlation-ID', correlationId);

  // Standard Success Response helper
  res.success = (data = null, message = 'Operation succeeded', pagination = null) => {
    return res.status(200).json({
      success: true,
      message,
      requestId,
      correlationId,
      data,
      pagination
    });
  };

  // Standard Error Response helper
  res.error = (message = 'An unexpected error occurred', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      requestId,
      correlationId,
      errors: errors.length > 0 ? errors : undefined
    });
  };

  next();
};
