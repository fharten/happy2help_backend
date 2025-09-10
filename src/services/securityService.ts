import crypto from 'crypto';
import { JWTService } from './jwtService';

export class SecurityService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static keyRotationInterval: NodeJS.Timeout | null = null;

  static startTokenCleanup(intervalMs: number = 3600000): void {
    // DEFAULT: 1h
    if (this.cleanupInterval) {
      console.warn('Token cleanup is already scheduled');
      return;
    }

    // RUN CLEANUP AT SPECIFIED INTERVAL
    this.cleanupInterval = setInterval(async () => {
      try {
        console.log('Starting scheduled token cleanup...');
        const cleanedCount = await JWTService.cleanupExpiredTokens();
        const stats = await JWTService.getTokenStats();

        console.log(`Cleaned up ${cleanedCount} expired refresh tokens`);
        console.log(`Token stats:`, stats);
      } catch (error) {
        console.error('Error during token cleanup:', error);
      }
    }, intervalMs);

    console.log(`Token cleanup scheduled to run every ${intervalMs / 1000 / 60} minutes`);
  }

  static scheduleKeyRotation(intervalMs: number): void {
    // e.g., 30 days = 30*24*60*60*1000 = 2.592.000.000
    if (this.keyRotationInterval) {
      console.warn('Key rotation is already scheduled');
      return;
    }

    // SCHEDULE KEY ROTATION
    this.keyRotationInterval = setInterval(async () => {
      await this.initiateKeyRotation();
    }, intervalMs);

    console.log(`Key rotation scheduled to run every ${intervalMs / 1000 / 60 / 60 / 24} days`);
  }

  static async initiateKeyRotation(): Promise<void> {
    console.warn('=== KEY ROTATION INITIATED ===');
    console.warn('Time:', new Date().toISOString());

    // Generate new key recommendations
    const newJwtSecret = crypto.randomBytes(32).toString('hex');
    const newRefreshSecret = crypto.randomBytes(32).toString('hex');

    console.warn('Suggested new environment variables:');
    console.warn(`JWT_SECRET=${newJwtSecret}`);
    console.warn(`JWT_REFRESH_SECRET=${newRefreshSecret}`);
    console.warn('');

    try {
      // Uberspace hosting
      if (process.env.USER && process.env.HOME?.includes('/home/')) {
        await this.updateUberspaceConfig({
          JWT_SECRET: newJwtSecret,
          JWT_REFRESH_SECRET: newRefreshSecret,
        });
        console.warn('Service configuration updated - restarting application');
      } else {
        throw new Error('Uberspace hosting environment not detected');
      }
    } catch (error) {
      console.error('Failed to automatically rotate keys:', error);
      this.logManualInstructions(newJwtSecret, newRefreshSecret);
    }

    console.warn('================================');
  }


  private static async updateUberspaceConfig(vars: Record<string, string>): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const serviceConfigPath = path.join(process.env.HOME || '', 'etc/services.d/happy2help.ini');

    try {
      // Read existing supervisord config
      let config = await fs.readFile(serviceConfigPath, 'utf-8');

      // Update environment section
      const envVars = Object.entries(vars)
        .map(([key, value]) => `${key}="${value}"`)
        .join(',');

      // Replace or add environment line
      if (config.includes('environment=')) {
        config = config.replace(/environment=.*/, `environment=${envVars},NODE_ENV=production`);
      } else {
        config += `\nenvironment=${envVars},NODE_ENV=production`;
      }

      // Write updated config
      await fs.writeFile(serviceConfigPath, config);

      // Restart the service via supervisorctl
      await execAsync('supervisorctl reread');
      await execAsync('supervisorctl update happy2help');
      await execAsync('supervisorctl restart happy2help');

      console.log('Uberspace service configuration updated and restarted');
    } catch (error) {
      throw new Error(`Failed to update Uberspace config: ${error}`);
    }
  }

  private static logManualInstructions(jwtSecret: string, refreshSecret: string): void {
    console.warn('Manual key rotation required:');
    console.warn('UBERSPACE.DE:');
    console.warn('1. SSH into your Uberspace');
    console.warn('2. Edit ~/etc/services.d/happy2help.ini');
    console.warn(
      `3. Update environment line with: JWT_SECRET="${jwtSecret}",JWT_REFRESH_SECRET="${refreshSecret}",NODE_ENV=production`
    );
    console.warn(
      '4. Run: supervisorctl reread && supervisorctl update && supervisorctl restart happy2help'
    );
    console.warn('');
    console.warn('ALTERNATIVE - Update .env file:');
    console.warn(`echo 'JWT_SECRET=${jwtSecret}' > ~/.env`);
    console.warn(`echo 'JWT_REFRESH_SECRET=${refreshSecret}' >> ~/.env`);
    console.warn('supervisorctl restart happy2help');
  }

  static async getSecurityReport(): Promise<{
    tokenStats: any;
    lastCleanup: string;
    cleanupScheduled: boolean;
    keyRotationScheduled: boolean;
    securityRecommendations: string[];
  }> {
    const stats = await JWTService.getTokenStats();

    const recommendations: string[] = [];

    if (stats.revokedAccessTokens > 1000) {
      recommendations.push('Consider restarting application to clear revoked access token cache');
    }

    if (stats.revokedRefreshTokens > stats.activeRefreshTokens) {
      recommendations.push('High number of revoked tokens detected - review security policies');
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      recommendations.push('JWT_SECRET should be at least 32 characters long');
    }

    if (!this.keyRotationInterval) {
      recommendations.push('Consider scheduling regular key rotation');
    }

    return {
      tokenStats: stats,
      lastCleanup: new Date().toISOString(),
      cleanupScheduled: !!this.cleanupInterval,
      keyRotationScheduled: !!this.keyRotationInterval,
      securityRecommendations: recommendations,
    };
  }

  static validateSecuritySettings(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // CHECK JWT_SECRET
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET environment variable is required');
    } else if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }

    // CHECK JWT_REFRESH_SECRET
    if (!process.env.JWT_REFRESH_SECRET) {
      errors.push('JWT_REFRESH_SECRET environment variable is required');
    } else if (process.env.JWT_REFRESH_SECRET.length < 32) {
      errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    // CHECK if secrets are the same
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      warnings.push('JWT_SECRET and JWT_REFRESH_SECRET should be different');
    }

    // CHECK SALT_ROUNDS
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    if (saltRounds < 10) {
      warnings.push('SALT_ROUNDS should be at least 10 for better security');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Token cleanup stopped');
    }

    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
      console.log('Key rotation stopped');
    }

    console.log('Security service stopped');
  }
}
