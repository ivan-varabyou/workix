import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  PhoneOtpResponseDto,
  PhoneOtpService,
  PhoneOtpUserInfoDto,
  PhoneOtpVerifyResponseDto,
  SendPhoneOtpDto,
  VerifyPhoneOtpDto,
} from '@workix/domain/auth';

import {
  SendOtpResponse,
  VerifyOtpResponse,
} from './phone-otp.controller.interfaces';
import { SendPhoneOtpRequestDto, VerifyPhoneOtpRequestDto } from './phone-otp.controller.dtos';

/**
 * Phone OTP Controller
 * Handles phone OTP authentication
 */
@Controller('auth/phone-otp')
@ApiTags('phone-otp')
@ApiExtraModels(PhoneOtpResponseDto, PhoneOtpUserInfoDto, PhoneOtpVerifyResponseDto, SendPhoneOtpRequestDto, VerifyPhoneOtpRequestDto)
export class PhoneOtpController {
  private readonly logger: Logger = new Logger(PhoneOtpController.name);

  constructor(private phoneOtpService: PhoneOtpService) {}

  /**
   * Send OTP to phone
   */
  @Post('send')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiBody({ type: SendPhoneOtpRequestDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', type: () => PhoneOtpResponseDto })
  async sendOtp(@Body() sendPhoneOtpDto: SendPhoneOtpDto): Promise<PhoneOtpResponseDto> {
    try {
      if (!sendPhoneOtpDto.phoneNumber) {
        throw new BadRequestException('Phone number is required');
      }
      const result: SendOtpResponse = await this.phoneOtpService.sendOtp(sendPhoneOtpDto.phoneNumber);
      const response: PhoneOtpResponseDto = {
        id: result.id,
        phoneNumber: result.expiresAt.toString(), // Placeholder, should be masked
        expiresAt: result.expiresAt,
        message: result.message,
      };
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error sending OTP:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Verify OTP and authenticate
   */
  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP and authenticate' })
  @ApiBody({ type: VerifyPhoneOtpRequestDto })
  @ApiResponse({ status: 200, description: 'OTP verified and authenticated', type: () => PhoneOtpVerifyResponseDto })
  async verifyOtp(
    @Body() verifyPhoneOtpDto: VerifyPhoneOtpDto
  ): Promise<PhoneOtpVerifyResponseDto> {
    try {
      if (!verifyPhoneOtpDto.phoneNumber || !verifyPhoneOtpDto.code) {
        throw new BadRequestException('Phone number and code are required');
      }
      const result: VerifyOtpResponse = await this.phoneOtpService.verifyOtp(
        verifyPhoneOtpDto.phoneNumber,
        verifyPhoneOtpDto.code,
        verifyPhoneOtpDto.email,
        verifyPhoneOtpDto.name
      );

      const userData: PhoneOtpUserInfoDto = {
        id: result.user.id,
        phoneNumber: result.user.phoneNumber,
        email: result.user.email ?? undefined,
        name: result.user.name ?? undefined,
      };

      const response: PhoneOtpVerifyResponseDto = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: userData,
      };
      return response;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      this.logger.error('Error verifying OTP:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
