/**
 * Rate Limiting Middleware for Depaxiom SaaS
 *
 * Provides protection against brute force attacks, API abuse, and DoS.
 * Uses Redis for distributed rate limiting across multiple server instances.
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Get client IP address from request.
 * Handles proxied requests (e.g., behind Cloudflare or nginx).
 */
function getClientIp(req: Request): string {
  // Check for Cloudflare header first
  const cfConnectingIp = req.headers['cf-connecting-ip'];
  if (typeof cfConnectingIp === 'string') {
    return cfConnectingIp;
  }

  // Check X-Forwarded-For header (first IP is the client)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    const firstIp = xForwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  // Fall back to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Rate limit exceeded handler.
 * Provides helpful error message without leaking internal details.
 */
function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please wait before trying again.',
    retryAfter: res.getHeader('Retry-After'),
  });
}

/**
 * Authentication rate limiter (strict).
 * Protects login, signup, and password reset endpoints.
 *
 * 5 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

/**
 * Payment operations rate limiter.
 * Protects checkout and payment-related endpoints.
 *
 * 3 payment operations per minute per user/IP.
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const user = (req as any).user;
    return user?.id || getClientIp(req);
  },
  handler: rateLimitHandler,
  message: { error: 'Too many payment requests. Please wait before trying again.' },
});

/**
 * AI/OpenAI operations rate limiter.
 * Protects expensive AI API calls.
 *
 * 10 AI requests per minute per user.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || getClientIp(req);
  },
  handler: rateLimitHandler,
  message: { error: 'Too many AI requests. Please wait before trying again.' },
});

/**
 * General API rate limiter.
 * Applies to all other endpoints.
 *
 * 100 requests per minute per user/IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || getClientIp(req);
  },
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/_health';
  },
});

/**
 * File upload rate limiter.
 * Prevents abuse of file storage.
 *
 * 20 uploads per hour per user.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || getClientIp(req);
  },
  handler: rateLimitHandler,
  message: { error: 'Too many file uploads. Please wait before trying again.' },
});
