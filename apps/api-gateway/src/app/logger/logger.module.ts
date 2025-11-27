import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

/**
 * Logger Module
 * Provides structured logging with Winston
 */
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
        const isProduction = nodeEnv === 'production';

        // Define log format
        const logFormat = winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        );

        // Console format for development
        const consoleFormat = winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf((info) => {
            const { timestamp, level, message, context, ...meta } = info;
            const contextStr = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
          }),
        );

        return {
          transports: [
            // Console transport
            new winston.transports.Console({
              level: isProduction ? 'info' : 'debug',
              format: isProduction ? logFormat : consoleFormat,
            }),
            // File transport for errors
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: logFormat,
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
            // File transport for all logs
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: logFormat,
              maxsize: 5242880, // 5MB
              maxFiles: 5,
            }),
            // File transport for admin activity
            new winston.transports.File({
              filename: 'logs/admin-activity.log',
              level: 'info',
              format: logFormat,
              maxsize: 5242880, // 5MB
              maxFiles: 10,
            }),
          ],
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
