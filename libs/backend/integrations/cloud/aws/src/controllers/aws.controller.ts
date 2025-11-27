import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AwsIntegrationDto, EC2ControlDto, LambdaInvokeDto, S3UploadDto } from '../dto/aws.dto';
import { AwsService } from '../services/aws.service';
import { AwsIntegrationService } from '../services/aws-integration.service';

@ApiTags('aws-integration')
@Controller('aws')
export class AwsController {
  constructor(
    private readonly awsIntegrationService: AwsIntegrationService,
    private readonly awsService: AwsService
  ) {}

  /**
   * Create AWS integration
   */
  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create AWS integration for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'AWS integration created successfully',
  })
  async createIntegration(@Body() dto: AwsIntegrationDto): Promise<any> {
    if (!dto.region || !dto.services) {
      throw new Error('Region and services are required');
    }
    return await this.awsIntegrationService.createIntegration(
      'current-user-id',
      dto.region,
      dto.services
    );
  }

  /**
   * Get user's AWS integration
   */
  @Get('integration')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current AWS integration' })
  @ApiResponse({ status: 200, description: 'AWS integration details' })
  async getIntegration(): Promise<any> {
    return await this.awsIntegrationService.getIntegration('current-user-id');
  }

  /**
   * Upload file to S3
   */
  @Post('s3/upload')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload file to S3' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadToS3(@Body() dto: S3UploadDto): Promise<any> {
    if (!dto.key) {
      throw new Error('Key is required');
    }
    // In real implementation, file would be multipart form data
    return await this.awsIntegrationService.uploadFile(
      'current-user-id',
      dto.key,
      Buffer.from('file-content'),
      dto.contentType
    );
  }

  /**
   * List S3 objects
   */
  @Get('s3/objects')
  @HttpCode(200)
  @ApiOperation({ summary: 'List S3 objects' })
  @ApiResponse({ status: 200, description: 'List of S3 objects' })
  async listS3Objects(): Promise<any[]> {
    return await this.awsService.listS3Objects();
  }

  /**
   * Delete from S3
   */
  @Delete('s3/:key')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete file from S3' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFromS3(@Param('key') key: string): Promise<any> {
    await this.awsService.deleteFromS3(key);
    return { message: 'File deleted successfully' };
  }

  /**
   * Invoke Lambda function
   */
  @Post('lambda/invoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invoke Lambda function' })
  @ApiResponse({ status: 200, description: 'Lambda function executed' })
  async invokeLambda(@Body() dto: LambdaInvokeDto): Promise<any> {
    if (!dto.functionName) {
      throw new Error('Function name is required');
    }
    return await this.awsIntegrationService.executeLambda(
      'current-user-id',
      dto.functionName,
      dto.payload || {}
    );
  }

  /**
   * List Lambda functions
   */
  @Get('lambda/functions')
  @HttpCode(200)
  @ApiOperation({ summary: 'List Lambda functions' })
  @ApiResponse({ status: 200, description: 'List of Lambda functions' })
  async listLambdaFunctions(): Promise<any[]> {
    return await this.awsService.listLambdaFunctions();
  }

  /**
   * Get Lambda function details
   */
  @Get('lambda/:functionName')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get Lambda function details' })
  @ApiResponse({ status: 200, description: 'Lambda function details' })
  async getLambdaFunction(@Param('functionName') functionName: string): Promise<any> {
    return await this.awsService.getLambdaFunction(functionName);
  }

  /**
   * List EC2 instances
   */
  @Get('ec2/instances')
  @HttpCode(200)
  @ApiOperation({ summary: 'List EC2 instances' })
  @ApiResponse({ status: 200, description: 'List of EC2 instances' })
  async listEC2Instances(): Promise<any[]> {
    return await this.awsService.listEC2Instances();
  }

  /**
   * Control EC2 instance
   */
  @Post('ec2/control')
  @HttpCode(200)
  @ApiOperation({ summary: 'Control EC2 instance' })
  @ApiResponse({ status: 200, description: 'EC2 instance action executed' })
  async controlEC2Instance(@Body() dto: EC2ControlDto): Promise<any> {
    if (!dto.instanceId || !dto.action) {
      throw new Error('Instance ID and action are required');
    }
    switch (dto.action) {
      case 'start':
        await this.awsService.startEC2Instance(dto.instanceId);
        break;
      case 'stop':
        await this.awsService.stopEC2Instance(dto.instanceId);
        break;
      default:
        throw new Error(`Unsupported action: ${dto.action}`);
    }

    return { message: `EC2 instance ${dto.action} executed` };
  }

  /**
   * Get CloudWatch metrics
   */
  @Get('cloudwatch/:namespace/:metricName')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get CloudWatch metrics' })
  @ApiResponse({ status: 200, description: 'CloudWatch metrics' })
  async getCloudWatchMetrics(
    @Param('namespace') namespace: string,
    @Param('metricName') metricName: string
  ): Promise<any> {
    return await this.awsService.getCloudWatchMetrics(namespace, metricName);
  }

  /**
   * Get infrastructure status
   */
  @Get('status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get AWS infrastructure status' })
  @ApiResponse({ status: 200, description: 'Infrastructure status' })
  async getInfrastructureStatus(): Promise<any> {
    return await this.awsIntegrationService.getInfrastructureStatus('current-user-id');
  }

  /**
   * Get account info
   */
  @Get('account')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get AWS account information' })
  @ApiResponse({ status: 200, description: 'AWS account information' })
  async getAccountInfo(): Promise<any> {
    return await this.awsService.getAccountInfo();
  }

  /**
   * Deactivate integration
   */
  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate AWS integration' })
  @ApiResponse({ status: 200, description: 'Integration deactivated' })
  async deactivateIntegration(@Param('integrationId') integrationId: string): Promise<any> {
    await this.awsIntegrationService.deactivateIntegration(integrationId);
    return { message: 'Integration deactivated successfully' };
  }
}
