/**
 * Server Setup for Depaxiom SaaS
 *
 * This module configures Express middleware including:
 * - Security headers (via helmet)
 * - Rate limiting for API protection
 * - Request logging (optional)
 */

import helmet from 'helmet';
import type { Application } from 'express';
import {
  authLimiter,
  paymentLimiter,
  aiLimiter,
  apiLimiter,
  uploadLimiter,
} from './middleware/rateLimit.js';

/**
 * Server setup function called by Wasp during server initialization.
 */
export const serverSetup = async (context: { app: Application }) => {
  const { app } = context;

  // =========================================================================
  // Security Headers (via Helmet)
  // =========================================================================

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for some React patterns
            'plausible.io',
            'js.stripe.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', '*.stripe.com'],
          connectSrc: [
            "'self'",
            'https://api.stripe.com',
            'https://api.openai.com',
            'https://plausible.io',
          ],
          frameSrc: [
            "'self'",
            'https://js.stripe.com',
            'https://checkout.stripe.com',
          ],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      // Disable X-Powered-By header
      hidePoweredBy: true,
    }),
  );

  // =========================================================================
  // Rate Limiting
  // =========================================================================

  // Apply stricter rate limiting to authentication routes
  app.use('/auth', authLimiter);

  // Apply payment rate limiting to checkout and subscription routes
  app.use('/api/generate-checkout-session', paymentLimiter);
  app.use('/api/generate-customer-portal-url', paymentLimiter);
  app.use('/payments-webhook', paymentLimiter);

  // Apply AI rate limiting to OpenAI-related endpoints
  app.use('/api/generate-gpt-response', aiLimiter);

  // Apply upload rate limiting to file upload endpoints
  app.use('/api/create-file-upload-url', uploadLimiter);
  app.use('/api/add-file-to-db', uploadLimiter);

  // Apply general rate limiting to all other API routes
  app.use('/api', apiLimiter);

  // =========================================================================
  // Request Logging (only in development)
  // =========================================================================

  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  console.log('[Server] Security middleware initialized');
};
