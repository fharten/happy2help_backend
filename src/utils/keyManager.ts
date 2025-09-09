import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface KeyPair {
  keyId: string;
  privateKey: string;
  publicKey: string;
  createdAt: Date;
}

export class KeyManager {
  private static readonly KEYS_DIR = path.join(process.cwd(), 'keys');
  private static readonly CURRENT_KEY_FILE = 'current.json';
  private static readonly PREVIOUS_KEY_FILE = 'previous.json';

  // Initialize key manager and ensure directory exists
  static async initialize(): Promise<void> {
    try {
      await fs.access(this.KEYS_DIR);
    } catch {
      await fs.mkdir(this.KEYS_DIR, { recursive: true });
    }

    // Generate initial key pair if none exists
    const currentKeyPath = path.join(this.KEYS_DIR, this.CURRENT_KEY_FILE);
    try {
      await fs.access(currentKeyPath);
    } catch {
      await this.generateNewKeyPair();
    }
  }

  // Generate new RSA key pair
  private static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { privateKey, publicKey };
  }

  // Generate new key pair and rotate existing ones
  static async generateNewKeyPair(): Promise<KeyPair> {
    const { privateKey, publicKey } = this.generateKeyPair();
    const keyId = crypto.randomUUID();

    const newKeyPair: KeyPair = {
      keyId,
      privateKey,
      publicKey,
      createdAt: new Date(),
    };

    // Move current to previous (if exists)
    const currentKeyPath = path.join(this.KEYS_DIR, this.CURRENT_KEY_FILE);
    const previousKeyPath = path.join(this.KEYS_DIR, this.PREVIOUS_KEY_FILE);

    try {
      const currentKey = await fs.readFile(currentKeyPath, 'utf-8');
      await fs.writeFile(previousKeyPath, currentKey);
    } catch {
      // No current key exists, this is fine
    }

    // Save new key as current
    await fs.writeFile(currentKeyPath, JSON.stringify(newKeyPair, null, 2));

    return newKeyPair;
  }

  // Get current key pair
  static async getCurrentKeyPair(): Promise<KeyPair | null> {
    try {
      const currentKeyPath = path.join(this.KEYS_DIR, this.CURRENT_KEY_FILE);
      const keyData = await fs.readFile(currentKeyPath, 'utf-8');
      const keyPair = JSON.parse(keyData);
      
      // Convert createdAt string back to Date
      keyPair.createdAt = new Date(keyPair.createdAt);
      
      return keyPair;
    } catch {
      return null;
    }
  }

  // Get previous key pair (for verifying old tokens)
  static async getPreviousKeyPair(): Promise<KeyPair | null> {
    try {
      const previousKeyPath = path.join(this.KEYS_DIR, this.PREVIOUS_KEY_FILE);
      const keyData = await fs.readFile(previousKeyPath, 'utf-8');
      const keyPair = JSON.parse(keyData);
      
      // Convert createdAt string back to Date
      keyPair.createdAt = new Date(keyPair.createdAt);
      
      return keyPair;
    } catch {
      return null;
    }
  }

  // Get public keys for JWKS endpoint
  static async getPublicKeys(): Promise<Array<{ keyId: string; publicKey: string; createdAt: Date }>> {
    const keys: Array<{ keyId: string; publicKey: string; createdAt: Date }> = [];

    const current = await this.getCurrentKeyPair();
    if (current) {
      keys.push({
        keyId: current.keyId,
        publicKey: current.publicKey,
        createdAt: current.createdAt,
      });
    }

    const previous = await this.getPreviousKeyPair();
    if (previous) {
      keys.push({
        keyId: previous.keyId,
        publicKey: previous.publicKey,
        createdAt: previous.createdAt,
      });
    }

    return keys;
  }

  // Manual key rotation
  static async rotateKeys(): Promise<KeyPair> {
    console.log('Rotating JWT signing keys...');
    return await this.generateNewKeyPair();
  }

  // Check if key rotation is needed (e.g., every 30 days)
  static async shouldRotateKeys(): Promise<boolean> {
    const current = await this.getCurrentKeyPair();
    if (!current) {
      return true;
    }

    const age = Date.now() - current.createdAt.getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    return age > thirtyDays;
  }

  // Rotate keys if needed
  static async rotateKeysIfNeeded(): Promise<boolean> {
    if (await this.shouldRotateKeys()) {
      await this.generateNewKeyPair();
      return true;
    }
    return false;
  }

  // Clean up old key files (for compatibility with old file structure)
  static async cleanupOldKeys(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      // This is a placeholder for compatibility - simplified key structure only keeps current/previous
      console.log('Key cleanup - simplified structure only maintains current and previous keys');
    } catch (error) {
      console.error('Error cleaning up old keys:', error);
    }
  }
}