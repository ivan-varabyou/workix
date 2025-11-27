import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { AuthService, PasswordResetService } from '@workix/domain/auth';
import { UserProfileService } from '@workix/domain/users';
import { PubSubEvent, PubSubSubscriberService } from '@workix/shared/backend/core';

/**
 * UserRegistrationSubscriberService
 * Subscribes to user.register.request events from API Gateway
 * and processes user registration asynchronously
 */
@Injectable()
export class UserRegistrationSubscriberService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(UserRegistrationSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly userProfileService: UserProfileService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Subscribe to user.register.request events after application bootstrap
    // This ensures the server is running before subscribing
    try {
      await this.pubSub.subscribe('user.*', async (event: PubSubEvent): Promise<void> => {
        await this.handleUserEvent(event);
      });
      this.logger.log('Subscribed to user.* events for registration processing');
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to subscribe to user.* events: ${errorMessage}`);
      // Don't throw - allow service to start even if subscription fails
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from user.* events');
  }

  private async handleUserEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'user.register.request') {
        await this.handleRegistrationRequest(event.data);
      } else if (eventName === 'user.password-reset.request') {
        await this.handlePasswordResetRequest(event.data);
      } else if (eventName === 'user.profile.update.request') {
        await this.handleProfileUpdateRequest(event.data);
      } else if (eventName === 'user.profile.delete.request') {
        await this.handleProfileDeleteRequest(event.data);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling user event: ${errorMessage}`);
    }
  }

  private async handleRegistrationRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object') {
        this.logger.warn('Invalid registration request data');
        return;
      }

      const registrationData = data as {
        taskId?: string;
        email?: string;
        password?: string;
        name?: string;
        timestamp?: string;
      };

      if (!registrationData.email || !registrationData.password) {
        this.logger.warn('Missing email or password in registration request');
        return;
      }

      this.logger.log(
        `Processing registration request for ${registrationData.email} (taskId: ${registrationData.taskId})`
      );

      // Process registration asynchronously
      const user = await this.authService.register({
        email: registrationData.email,
        password: registrationData.password,
        name: registrationData.name || registrationData.email.split('@')[0] || 'User',
      });

      this.logger.log(`User registered successfully: ${user.id} (${user.email})`);

      // Send welcome email via Message Queue (email verification will be handled by email verification service)
      // For now, we just log - email verification should be triggered separately
      // The user.registered event is already published by AuthService, which can trigger welcome email

      this.logger.log(
        `Registration completed for ${user.email} (taskId: ${registrationData.taskId})`
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process registration request: ${errorMessage}`);

      // In a real scenario, you might want to publish a failure event
      // or send an error notification to the user
    }
  }

  private async handlePasswordResetRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object') {
        this.logger.warn('Invalid password reset request data');
        return;
      }

      const resetData = data as {
        taskId?: string;
        email?: string;
        timestamp?: string;
      };

      if (!resetData.email) {
        this.logger.warn('Missing email in password reset request');
        return;
      }

      this.logger.log(
        `Processing password reset request for ${resetData.email} (taskId: ${resetData.taskId})`
      );

      // Process password reset request asynchronously
      await this.passwordResetService.requestPasswordReset(resetData.email);

      this.logger.log(
        `Password reset request processed for ${resetData.email} (taskId: ${resetData.taskId})`
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process password reset request: ${errorMessage}`);

      // In a real scenario, you might want to publish a failure event
      // or send an error notification to the user
    }
  }

  private async handleProfileUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object') {
        this.logger.warn('Invalid profile update request data');
        return;
      }

      const updateData = data as {
        taskId?: string;
        userId?: string;
        updateData?: {
          firstName?: string;
          lastName?: string;
          bio?: string;
          phoneNumber?: string;
        };
        timestamp?: string;
      };

      if (!updateData.userId || !updateData.updateData) {
        this.logger.warn('Missing userId or updateData in profile update request');
        return;
      }

      this.logger.log(
        `Processing profile update request for ${updateData.userId} (taskId: ${updateData.taskId})`
      );

      // Process profile update asynchronously
      await this.userProfileService.updateProfile(updateData.userId, updateData.updateData);

      this.logger.log(
        `Profile update processed for ${updateData.userId} (taskId: ${updateData.taskId})`
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process profile update request: ${errorMessage}`);
    }
  }

  private async handleProfileDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data
      if (!data || typeof data !== 'object') {
        this.logger.warn('Invalid profile delete request data');
        return;
      }

      const deleteData = data as {
        taskId?: string;
        userId?: string;
        timestamp?: string;
      };

      if (!deleteData.userId) {
        this.logger.warn('Missing userId in profile delete request');
        return;
      }

      this.logger.log(
        `Processing profile delete request for ${deleteData.userId} (taskId: ${deleteData.taskId})`
      );

      // Process profile deletion asynchronously
      await this.userProfileService.deleteProfile(deleteData.userId);

      this.logger.log(
        `Profile deletion processed for ${deleteData.userId} (taskId: ${deleteData.taskId})`
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process profile delete request: ${errorMessage}`);
    }
  }
}
