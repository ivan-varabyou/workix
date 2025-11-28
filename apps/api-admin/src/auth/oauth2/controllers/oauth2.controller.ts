import { BadRequestException, Controller, Get, Logger, Param, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  JwtGuard,
  JwtPayload,
  OAuth2Service,
  OAuthLoginResponseDto,
  OAuthUserInfoDto,
  OAuthUserInfoResponseDto,
  SocialAccountDto,
  UnlinkSocialAccountResponseDto,
} from '@workix/domain/auth';
import type { HttpRequest, HttpResponse } from '@workix/shared/backend/core';
import { expressRequestToHttpRequest, expressResponseToHttpResponse, isExpressRequest, isExpressResponse } from '@workix/shared/backend/core';

import { isOAuthUserInfoDto } from './oauth2.controller.type-guards';

/**
 * OAuth2 Controller
 * Handles OAuth2 login endpoints for Google, Apple, and GitHub
 */
@Controller('auth/oauth')
@ApiTags('oauth2')
@ApiExtraModels(
  OAuthLoginResponseDto,
  OAuthUserInfoResponseDto,
  SocialAccountDto,
  UnlinkSocialAccountResponseDto,
)
export class OAuth2Controller {
  private readonly logger: Logger = new Logger(OAuth2Controller.name);

  constructor(private oauth2Service: OAuth2Service) {}

  /**
   * Google OAuth2 login initiation
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  async googleLogin(): Promise<void> {
    // AuthGuard redirects to Google
  }

  /**
   * Google OAuth2 callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful - redirects with tokens', type: () => OAuthLoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid OAuth callback' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  @ApiResponse({ status: 403, description: 'OAuth authentication forbidden' })
  async googleCallback(@Req() req: unknown, @Res() res: unknown): Promise<void> {
    // Convert framework-specific Request/Response to abstractions
    // req/res are unknown to avoid dependency on Express types
    // Use type guards to safely convert
    if (!isExpressRequest(req) || !isExpressResponse(res)) {
      throw new BadRequestException('Invalid request or response type');
    }
    const httpReq: HttpRequest = expressRequestToHttpRequest(req);
    const httpRes: HttpResponse = expressResponseToHttpResponse(res);

    try {
      // Check if Passport authentication failed (user is undefined and there's an error)
      if (!httpReq.user && httpReq.query?.error) {
        throw new UnauthorizedException('OAuth authentication failed');
      }
      // Validate state parameter if present (CSRF protection)
      const state: string | undefined = httpReq.query?.state as string | undefined;
      if (state) {
        // In production, validate state against stored value
        // For now, just check it's not empty
        if (state.length === 0) {
          throw new BadRequestException('Invalid OAuth state parameter');
        }
      }

      // Type guard for user property
      const userValue: unknown = httpReq.user;
      const user: OAuthUserInfoDto | undefined = isOAuthUserInfoDto(userValue) ? userValue : undefined;
      if (!user) {
        throw new BadRequestException('OAuth authentication failed - user not found');
      }
      const loginResponse: OAuthLoginResponseDto = await this.oauth2Service.handleOAuthLogin('google', user);

      // Redirect with tokens (in production, use secure httpOnly cookies)
      httpRes.redirect(
        `http://localhost:7300/oauth-success?token=${loginResponse.accessToken}&refresh=${loginResponse.refreshToken}`
      );
    } catch (error: unknown) {
      this.logger.error('Google OAuth callback error:', error);
      // Don't expose internal error details
      if (error instanceof BadRequestException) {
        httpRes.status(400).json({ message: error.message });
        return;
      }
      // For authentication failures, return 401
      if (error instanceof Error && error.message.includes('authentication')) {
        httpRes.status(401).json({ message: 'OAuth authentication failed' });
        return;
      }
      // For other errors, return 403 Forbidden
      httpRes.status(403).json({ message: 'OAuth authentication failed' });
    }
  }

  /**
   * GitHub OAuth2 login initiation
   */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth2 login' })
  async githubLogin(): Promise<void> {
    // AuthGuard redirects to GitHub
  }

  /**
   * GitHub OAuth2 callback
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth2 callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful - redirects with tokens', type: () => OAuthLoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid OAuth callback' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  async githubCallback(@Req() req: unknown, @Res() res: unknown): Promise<void> {
    // Convert framework-specific Request/Response to abstractions
    if (!isExpressRequest(req) || !isExpressResponse(res)) {
      throw new BadRequestException('Invalid request or response type');
    }
    const httpReq: HttpRequest = expressRequestToHttpRequest(req);
    const httpRes: HttpResponse = expressResponseToHttpResponse(res);

    try {
      // Validate state parameter if present (CSRF protection)
      const state: string | undefined = httpReq.query?.state as string | undefined;
      if (state) {
        // In production, validate state against stored value
        // For now, just check it's not empty
        if (state.length === 0) {
          throw new BadRequestException('Invalid OAuth state parameter');
        }
      }

      const userValue: unknown = httpReq.user;
      const user: OAuthUserInfoDto | undefined = isOAuthUserInfoDto(userValue) ? userValue : undefined;
      if (!user) {
        throw new BadRequestException('OAuth authentication failed - user not found');
      }
      const loginResponse: OAuthLoginResponseDto = await this.oauth2Service.handleOAuthLogin('github', user);

      httpRes.redirect(
        `http://localhost:7300/oauth-success?token=${loginResponse.accessToken}&refresh=${loginResponse.refreshToken}`
      );
    } catch (error: unknown) {
      this.logger.error('GitHub OAuth callback error:', error);
      // Don't expose internal error details
      if (error instanceof BadRequestException) {
        httpRes.status(400).json({ message: error.message });
        return;
      }
      // For authentication failures, return 401
      if (error instanceof Error && error.message.includes('authentication')) {
        httpRes.status(401).json({ message: 'OAuth authentication failed' });
        return;
      }
      // For other errors, return 403 Forbidden
      httpRes.status(403).json({ message: 'OAuth authentication failed' });
    }
  }

  /**
   * Apple Sign-In login initiation
   */
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Initiate Apple Sign-In' })
  async appleLogin(): Promise<void> {
    // AuthGuard redirects to Apple
  }

  /**
   * Apple Sign-In callback
   */
  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple Sign-In callback' })
  @ApiResponse({ status: 200, description: 'OAuth login successful - redirects with tokens', type: () => OAuthLoginResponseDto })
  async appleCallback(@Req() req: unknown, @Res() res: unknown): Promise<void> {
    // Convert framework-specific Request/Response to abstractions
    if (!isExpressRequest(req) || !isExpressResponse(res)) {
      throw new Error('Invalid request or response type');
    }
    const httpReq: HttpRequest = expressRequestToHttpRequest(req);
    const httpRes: HttpResponse = expressResponseToHttpResponse(res);

    try {
      const userValue: unknown = httpReq.user;
      const user: OAuthUserInfoDto | undefined = isOAuthUserInfoDto(userValue) ? userValue : undefined;
      if (!user) {
        throw new Error('User not found in request');
      }
      const loginResponse: OAuthLoginResponseDto = await this.oauth2Service.handleOAuthLogin('apple', user);

      httpRes.redirect(
        `http://localhost:7300/oauth-success?token=${loginResponse.accessToken}&refresh=${loginResponse.refreshToken}`
      );
    } catch (error: unknown) {
      this.logger.error('Apple OAuth callback error:', error);
      // Don't expose internal error details
      if (error instanceof BadRequestException) {
        httpRes.status(400).json({ message: error.message });
        return;
      }
      // For authentication failures, return 401
      if (error instanceof Error && error.message.includes('authentication')) {
        httpRes.status(401).json({ message: 'OAuth authentication failed' });
        return;
      }
      // For other errors, return 403 Forbidden
      httpRes.status(403).json({ message: 'OAuth authentication failed' });
    }
  }

  /**
   * Get current user's linked social accounts
   */
  @Get('me/accounts')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user social accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of social accounts',
    type: SocialAccountDto,
    isArray: true
  })
  async getUserSocialAccounts(@CurrentUser() user: JwtPayload): Promise<unknown[]> {
    return this.oauth2Service.getUserSocialAccounts(user.userId);
  }

  /**
   * Unlink social account
   */
  @Post(':provider/unlink')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink social account from user' })
  @ApiResponse({
    status: 200,
    description: 'Social account unlinked successfully',
    type: () => UnlinkSocialAccountResponseDto,
  })
  async unlinkSocialAccount(
    @CurrentUser() user: JwtPayload,
    @Param('provider') provider: 'google' | 'apple' | 'github'
  ): Promise<{ message: string }> {
    await this.oauth2Service.unlinkSocialAccount(user.userId, provider);
    return { message: `${provider} account unlinked successfully` };
  }
}
