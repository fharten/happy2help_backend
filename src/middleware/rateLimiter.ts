import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// RATE LIMITING FOR GENERAL API ENDPOINTS
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // Limit each IP to 100 requests
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// STRICTER RATE LIMITING FOR AUTH ENDPOINTS
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// BRUTE FORCE PROTECTION FOR LOGIN ATTEMPTS
interface FailureData {
  count: number;
  lastAttempt: Date;
  blocked: boolean;
  blockUntil?: Date;
}

export class BruteForceProtection {
  private static failures = new Map<string, FailureData>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly BLOCK_TIME = 30 * 60 * 1000; // 30 min
  private static readonly RESET_TIME = 60 * 60 * 1000; // 1 hour

  private static getKey(req: Request): string {
    const email = req.body?.email?.toLowerCase();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `${ip}:${email || 'no-email'}`;
  }

  static recordFailure(req: Request): void {
    const key = this.getKey(req);
    const now = new Date();
    const existing = this.failures.get(key);

    if (existing) {
      // RESET COUNTER IF LAST ATTEMPT WAS MORE THAN RESET TIME AGO
      if (now.getTime() - existing.lastAttempt.getTime() > this.RESET_TIME) {
        this.failures.delete(key);
        this.failures.set(key, {
          count: 1,
          lastAttempt: now,
          blocked: false,
        });
      } else {
        existing.count += 1;
        existing.lastAttempt = now;

        // BLOCK IF TOO MANY ATTEMPTS
        if (existing.count >= this.MAX_ATTEMPTS) {
          existing.blocked = true;
          existing.blockUntil = new Date(now.getTime() + this.BLOCK_TIME);
        }
      }
    } else {
      this.failures.set(key, {
        count: 1,
        lastAttempt: now,
        blocked: false,
      });
    }
  }

  static recordSuccess(req: Request): void {
    const key = this.getKey(req);
    this.failures.delete(key);
  }

  static isBlocked(req: Request): boolean {
    const key = this.getKey(req);
    const failure = this.failures.get(key);

    if (!failure || !failure.blocked) {
      return false;
    }

    // Check if block has expired
    if (failure.blockUntil && new Date() > failure.blockUntil) {
      this.failures.delete(key);
      return false;
    }

    return true;
  }

  static middleware(req: Request, res: Response, next: NextFunction): void | Response {
    if (BruteForceProtection.isBlocked(req)) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Account temporarily blocked.',
        retryAfter: 30 * 60, // 30 min
      });
    }
    next();
  }

  // CLEANUP EXPIRED ENTRIES PERIODICALLY
  static cleanup(): void {
    const now = new Date();
    for (const [key, failure] of this.failures.entries()) {
      if (failure.blockUntil && now > failure.blockUntil) {
        this.failures.delete(key);
      } else if (now.getTime() - failure.lastAttempt.getTime() > this.RESET_TIME) {
        this.failures.delete(key);
      }
    }
  }

  // MONITORING
  static getStatus(): {
    totalEntries: number;
    blockedEntries: number;
    entries: Array<{ key: string; count: number; blocked: boolean; lastAttempt: Date }>;
  } {
    const entries: Array<{ key: string; count: number; blocked: boolean; lastAttempt: Date }> = [];
    let blockedCount = 0;

    for (const [key, failure] of this.failures.entries()) {
      entries.push({
        key: key.split(':')[0] + ':***', // Hide email for privacy
        count: failure.count,
        blocked: failure.blocked,
        lastAttempt: failure.lastAttempt,
      });
      if (failure.blocked) blockedCount++;
    }

    return {
      totalEntries: this.failures.size,
      blockedEntries: blockedCount,
      entries,
    };
  }
}

// CLEANUP EVERY HOUR
setInterval(
  () => {
    BruteForceProtection.cleanup();
  },
  60 * 60 * 1000
);
