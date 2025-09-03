import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  /**
   * Hash a password securely with a random salt
   */
  static async toHash(password: string) {
    const salt = randomBytes(16).toString('hex'); // 16-byte random salt
    const buf = (await scryptAsync(password, salt, 64)) as Buffer; // scrypt hash

    return `${buf.toString('hex')}.${salt}`; // store hash and salt together
  }

  /**
   * Compare a supplied password with the stored hashed password
   * Uses timingSafeEqual to prevent timing attacks
   */
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    const hashedBuffer = Buffer.from(hashedPassword, 'hex');
    
    // Prevent timing attacks
    if (hashedBuffer.length !== buf.length) {
      return false;
    }
    return timingSafeEqual(buf, hashedBuffer);
  }
}
