import { BadRequestException, Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EmailVerificationResponseDto,
  EmailVerificationService,
  EmailVerifiedResponseDto,
  EmailVerifiedUserInfoDto,
  GetVerificationStatusResponseDto,
  ResendVerificationEmailDto,
  SendVerificationEmailDto,
  VerifyEmailDto,
} from '@workix/domain/auth';

import {
  ResendVerificationEmailResponse,
  SendVerificationEmailResponse,
  VerifyEmailResponse,
} from './email-verification.controller.interfaces';
import { SendVerificationEmailRequestDto, VerifyEmailRequestDto, ResendVerificationEmailRequestDto } from './email-verification.controller.dtos';

/**
 * Email Verification Controller
 * Handles email verification workflows
 */
@ApiTags('email-verification')
@ApiExtraModels(
  EmailVerificationResponseDto,
  EmailVerifiedUserInfoDto,
  EmailVerifiedResponseDto,
  GetVerificationStatusResponseDto,
  SendVerificationEmailRequestDto,
  VerifyEmailRequestDto,
  ResendVerificationEmailRequestDto,
)
@Controller('auth/email-verification')
export class EmailVerificationController {
  private readonly logger: Logger = new Logger(EmailVerificationController.name);

  constructor(private emailVerificationService: EmailVerificationService) {}

  /**
   * Send verification email
   */
  @Post('send')
  @ApiOperation({ summary: 'Send verification email' })
  @ApiBody({ type: SendVerificationEmailRequestDto })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully', type: () => EmailVerificationResponseDto })
  async sendVerificationEmail(
    @Body() sendVerificationEmailDto: SendVerificationEmailDto
  ): Promise<EmailVerificationResponseDto> {
    try {
      if (!sendVerificationEmailDto.email) {
        throw new BadRequestException('Email is required');
      }
      const result: SendVerificationEmailResponse = await this.emailVerificationService.sendVerificationEmail(
        sendVerificationEmailDto.email
      );

      const response: EmailVerificationResponseDto = {
        message: 'Verification email sent successfully',
        expiresAt: result.expiresAt,
      };
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error sending verification email:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Verify email with token
   */
  @Post('verify')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiBody({ type: VerifyEmailRequestDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully', type: () => EmailVerifiedResponseDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<EmailVerifiedResponseDto> {
    try {
      if (!verifyEmailDto.token) {
        throw new BadRequestException('Token is required');
      }
      const result: VerifyEmailResponse = await this.emailVerificationService.verifyEmail(verifyEmailDto.token);

      const userData: EmailVerifiedUserInfoDto = {
        id: result.user.id,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
      };

      const response: EmailVerifiedResponseDto = {
        message: result.message,
        user: userData,
      };
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error verifying email:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Resend verification email
   */
  @Post('resend')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendVerificationEmailRequestDto })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully', type: () => EmailVerificationResponseDto })
  async resendVerificationEmail(
    @Body() resendVerificationEmailDto: ResendVerificationEmailDto
  ): Promise<EmailVerificationResponseDto> {
    try {
      if (!resendVerificationEmailDto.email) {
        throw new BadRequestException('Email is required');
      }
      const result: ResendVerificationEmailResponse = await this.emailVerificationService.resendVerificationEmail(
        resendVerificationEmailDto.email
      );

      const response: EmailVerificationResponseDto = {
        message: result.message,
        expiresAt: result.expiresAt,
      };
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error resending verification email:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get verification status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get email verification status' })
  @ApiQuery({ name: 'email', type: String })
  @ApiResponse({ status: 200, description: 'Email verification status', type: () => GetVerificationStatusResponseDto })
  async getVerificationStatus(@Query('email') email: string): Promise<GetVerificationStatusResponseDto> {
    try {
      return await this.emailVerificationService.getVerificationStatus(email);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error getting verification status:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
