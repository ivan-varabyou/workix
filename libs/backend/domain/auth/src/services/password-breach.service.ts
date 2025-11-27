import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Password Breach Check Service
 * Integrates with HIBP (Have I Been Pwned)
 */
@Injectable()
export class PasswordBreachService {
  private readonly logger: Logger = new Logger(PasswordBreachService.name);
  private readonly HIBP_URL: string = 'https://api.pwnedpasswords.com/range/';

  /**
   * Check if password has been breached
   */
  async checkPasswordBreach(password: string): Promise<{ breached: boolean; count?: number }> {
    try {
      const sha1: string = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix: string = sha1.substring(0, 5);
      const suffix: string = sha1.substring(5);

      const response: Response = await fetch(`${this.HIBP_URL}${prefix}`, {
        headers: { 'User-Agent': 'Workix-Auth-Service' },
      });

      if (!response.ok) {
        this.logger.warn('HIBP API unavailable, allowing password');
        return { breached: false };
      }

      const text: string = await response.text();
      const hashes: string[] = text.split('\r\n');

      for (const hash of hashes) {
        const parts: string[] = hash.split(':');
        const hashSuffix: string | undefined = parts[0];
        const countStr: string | undefined = parts[1];
        if (hashSuffix === suffix && countStr) {
          const count: number = parseInt(countStr, 10);
          if (!isNaN(count)) {
            return { breached: true, count };
          }
        }
      }

      return { breached: false };
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Password breach check failed: ${errorMessage}, allowing password`);
      return { breached: false };
    }
  }
}
