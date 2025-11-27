import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Guard
 * Validates JWT tokens
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
