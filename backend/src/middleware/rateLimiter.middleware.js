// Sliding-window memory-based Rate Limiter configuration
class InMemoryRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map(); // IP -> Array of timestamps
  }

  limit() {
    return (req, res, next) => {
      const skipPaths = ['/health', '/api/health', '/api/v1/health'];
      if (skipPaths.includes(req.path)) {
        return next();
      }

      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const now = Date.now();

      if (!this.hits.has(ip)) {
        this.hits.set(ip, []);
      }

      // Filter hits outside the active window interval
      let timestamps = this.hits.get(ip);
      timestamps = timestamps.filter((time) => now - time < this.windowMs);
      
      if (timestamps.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfterSeconds: Math.ceil((this.windowMs - (now - timestamps[0])) / 1000)
        });
      }

      timestamps.push(now);
      this.hits.set(ip, timestamps);
      next();
    };
  }
}

// 1. General endpoints: 100 requests / 15 minutes
export const generalLimiter = new InMemoryRateLimiter(15 * 60 * 1000, 100).limit();

// 2. Auth/MFA endpoints: 10 requests / 1 minute
export const authLimiter = new InMemoryRateLimiter(1 * 60 * 1000, 10).limit();
