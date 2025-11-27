import { DynamicModule, Module } from '@nestjs/common';

import { AwsController } from './controllers/aws.controller';
import { EC2Config, LambdaConfig, S3Config } from './interfaces/aws-config.interface';
import { AWSPrismaService } from './interfaces/aws-prisma.interface';
import { AwsService } from './services/aws.service';
import { AwsIntegrationService } from './services/aws-integration.service';

@Module({})
export class AwsModule {
  static forRoot(
    s3Config?: S3Config,
    lambdaConfig?: LambdaConfig,
    ec2Config?: EC2Config,
    prismaService?: AWSPrismaService
  ): DynamicModule {
    return {
      module: AwsModule,
      providers: [
        ...(s3Config ? [{ provide: 'AWS_S3_CONFIG', useValue: s3Config }] : []),
        ...(lambdaConfig ? [{ provide: 'AWS_LAMBDA_CONFIG', useValue: lambdaConfig }] : []),
        ...(ec2Config ? [{ provide: 'AWS_EC2_CONFIG', useValue: ec2Config }] : []),
        ...(prismaService ? [{ provide: 'PrismaService', useValue: prismaService }] : []),
        AwsService,
        AwsIntegrationService,
      ],
      controllers: [AwsController],
      exports: [AwsService, AwsIntegrationService],
    };
  }
}
