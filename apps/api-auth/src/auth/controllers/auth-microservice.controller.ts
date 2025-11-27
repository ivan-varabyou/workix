import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService, LoginDto } from '@workix/domain/auth';

/**
 * Auth Microservice Controller
 * Handles messages from API Gateway via Redis transport
 * According to NestJS documentation: https://docs.nestjs.com/microservices/basics
 *
 * Message Patterns:
 * - auth.login - Login user
 * - auth.register - Register user
 * - auth.verify - Verify JWT token
 * - auth.refresh - Refresh access token
 * - auth.logout - Logout user
 */
@Controller()
export class AuthMicroserviceController {
  private readonly logger: Logger = new Logger(AuthMicroserviceController.name);

  constructor(private readonly authService: AuthService) {
    this.logger.log('AuthMicroserviceController initialized');
  }

  /**
   * Handle login request from API Gateway
   * Pattern: auth.login
   */
  @MessagePattern('auth.login')
  async handleLogin(@Payload() data: { email: string; password: string }): Promise<unknown> {
    this.logger.debug(`Received auth.login message for email: ${data.email}`);
    try {
      // AuthService.login takes LoginDto object
      const loginDto: LoginDto = {
        email: data.email,
        password: data.password,
      };
      const result: unknown = await this.authService.login(loginDto);
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in auth.login: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle register request from API Gateway
   * Pattern: auth.register
   */
  @MessagePattern('auth.register')
  async handleRegister(@Payload() data: { email: string; password: string; name: string }): Promise<unknown> {
    this.logger.debug(`Received auth.register message for email: ${data.email}`);
    try {
      const result: unknown = await this.authService.register({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in auth.register: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle token verification request
   * Pattern: auth.verify
   */
  @MessagePattern('auth.verify')
  async handleVerify(@Payload() data: { token: string }): Promise<unknown> {
    this.logger.debug('Received auth.verify message');
    try {
          const result: unknown = await this.authService.verifyToken(data.token);
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in auth.verify: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle token refresh request
   * Pattern: auth.refresh
   */
  @MessagePattern('auth.refresh')
  async handleRefresh(@Payload() data: { refreshToken: string }): Promise<unknown> {
    this.logger.debug('Received auth.refresh message');
    try {
          const result: unknown = await this.authService.refreshToken(data.refreshToken);
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in auth.refresh: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle logout request
   * Pattern: auth.logout
   */
  @MessagePattern('auth.logout')
  async handleLogout(@Payload() data: { refreshToken: string; userId: string }): Promise<unknown> {
    this.logger.debug(`Received auth.logout message for userId: ${data.userId}`);
    try {
      const result: unknown = await this.authService.logout(data.refreshToken, data.userId);
      return result;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in auth.logout: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Handle health check request
   * Pattern: auth.health
   */
  @MessagePattern('auth.health')
  async handleHealth(): Promise<{ status: string; timestamp: string; service: string }> {
    this.logger.debug('Received auth.health message');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-auth',
    };
  }
}
