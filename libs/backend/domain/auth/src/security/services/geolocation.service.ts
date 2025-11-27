import { Injectable, Logger } from '@nestjs/common';

/**
 * Geolocation Service
 * Determines location from IP address
 * Uses free APIs: ipapi.co, ip-api.com, or ipgeolocation.io
 */
@Injectable()
export class GeolocationService {
  private readonly logger: Logger = new Logger(GeolocationService.name);

  /**
   * Get location from IP address
   */
  async getLocationFromIp(ipAddress: string): Promise<{
    country?: string;
    countryName?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
  }> {
    // Skip localhost and private IPs
    if (this.isLocalOrPrivateIp(ipAddress)) {
      return {};
    }

    try {
      // Try ipapi.co first (free tier: 1000 requests/day)
      const location: Awaited<ReturnType<typeof this.getLocationFromIpapi>> = await this.getLocationFromIpapi(ipAddress);
      if (location) {
        return location;
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to get location from ipapi.co for ${ipAddress}: ${errorMessage}`);
    }

    try {
      // Fallback to ip-api.com (free tier: 45 requests/minute)
      const location: Awaited<ReturnType<typeof this.getLocationFromIpApi>> = await this.getLocationFromIpApi(ipAddress);
      if (location) {
        return location;
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to get location from ip-api.com for ${ipAddress}: ${errorMessage}`);
    }

    // If all APIs fail, return empty location
    this.logger.warn(`Could not determine location for IP ${ipAddress}`);
    return {};
  }

  /**
   * Get location from ipapi.co
   */
  private async getLocationFromIpapi(ipAddress: string): Promise<{
    country?: string;
    countryName?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
  } | null> {
    try {
      const response: Response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
        headers: {
          'User-Agent': 'Workix-Auth-Service/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

       
      const data: {
        error?: unknown;
        country_code?: string;
        country_name?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        org?: string;
      } = (await response.json()) as {
        error?: unknown;
        country_code?: string;
        country_name?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        org?: string;
      };

      if (data.error) {
        return null;
      }

      const result: {
        country?: string;
        countryName?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        isp?: string;
      } = {};
      if (data.country_code) result.country = data.country_code;
      if (data.country_name) result.countryName = data.country_name;
      if (data.region) result.region = data.region;
      if (data.city) result.city = data.city;
      if (data.latitude !== undefined) result.latitude = data.latitude;
      if (data.longitude !== undefined) result.longitude = data.longitude;
      if (data.org) result.isp = data.org;
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Get location from ip-api.com
   */
  private async getLocationFromIpApi(ipAddress: string): Promise<{
    country?: string;
    countryName?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
  } | null> {
    try {
      const response: Response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp`, {
        headers: {
          'User-Agent': 'Workix-Auth-Service/1.0',
        },
      });

      if (!response.ok) {
        return null;
      }

       
      const data: {
        status?: string;
        countryCode?: string;
        country?: string;
        regionName?: string;
        city?: string;
        lat?: number;
        lon?: number;
        isp?: string;
      } = (await response.json()) as {
        status?: string;
        countryCode?: string;
        country?: string;
        regionName?: string;
        city?: string;
        lat?: number;
        lon?: number;
        isp?: string;
      };

      if (data.status === 'fail') {
        return null;
      }

      const result: {
        country?: string;
        countryName?: string;
        region?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
        isp?: string;
      } = {};
      if (data.countryCode) result.country = data.countryCode;
      if (data.country) result.countryName = data.country;
      if (data.regionName) result.region = data.regionName;
      if (data.city) result.city = data.city;
      if (data.lat !== undefined) result.latitude = data.lat;
      if (data.lon !== undefined) result.longitude = data.lon;
      if (data.isp) result.isp = data.isp;
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Check if IP is localhost or private
   */
  private isLocalOrPrivateIp(ipAddress: string): boolean {
    if (ipAddress === 'localhost' || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return true;
    }

    // Private IP ranges
    const privateRanges: RegExp[] = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^fc00:/,
      /^fe80:/,
    ];

    return privateRanges.some((range: RegExp): boolean => range.test(ipAddress));
  }
}
