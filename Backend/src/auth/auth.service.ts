import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';
import { CustomMailerService } from '../shared/mailer/mailer service';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(

    private jwtService: JwtService,
    private mailerService: CustomMailerService,
    private prisma: PrismaService,
  ) {}

  private generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }
  private generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }
  async register(email: string, password: string, name: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = this.generateOTP();

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.CUSTOMER,
        isVerified: false,
        verificationToken: otpCode,
      },
    });

    try {
      await this.mailerService.sendWelcomeEmail(email, name, otpCode);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.warn(
        `Failed to send welcome email to ${email}: ${error.message}`,
      );
    }

    // Generate token for the new user (even if not verified yet)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      message:
        'Registration successful! Please check your email for verification code.',
      access_token: this.generateToken(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
  async verifyEmail(email: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified)
      throw new BadRequestException('Email is already verified');
    if (!user.verificationToken || user.verificationToken !== otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    const updated = await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Optionally, return a token for immediate login after verification
    const payload = {
      sub: updated.id,
      email: updated.email,
      role: updated.role,
    };
    return {
      message: 'Email verified successfully! You can now login.',
      access_token: this.generateToken(payload),
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    };
  }
  async manuallyVerifyEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isVerified) {
      return {
        message: 'User is already verified',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          role: user.role,
          isVerified: user.isVerified,
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationToken: null },
    });

    return {
      message: 'Email manually verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.name,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    };
  }
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified)
      throw new BadRequestException('Email is already verified');

    const otpCode = this.generateOTP();

    await this.prisma.user.update({
      where: { email },
      data: { verificationToken: otpCode },
    });

    try {
      await this.mailerService.sendEmailVerification(email, user.name, otpCode);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.warn(
          `Failed to send verification email to ${email}: ${error.message}`,
      );
    }

    return { message: 'Verification code sent to your email' };
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (
        !user.isVerified &&
        user.role !== Role.MAIN_ADMIN &&
        user.role !== Role.STALL_ADMIN
    ) {
      throw new UnauthorizedException(
          'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      message: 'Login successful',
      access_token: this.generateToken(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otpCode = this.generateOTP();

    await this.prisma.user.update({
      where: { email },
      data: { verificationToken: otpCode },
    });

    try {
      await this.mailerService.sendPasswordResetEmail(
          email,
          user.name,
          otpCode,
      );
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.warn(
          `Failed to send password reset email to ${email}: ${error.message}`,
      );
    }

    return { message: 'Password reset code sent to your email' };
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.verificationToken || user.verificationToken !== otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword, verificationToken: null },
    });

    return { message: 'Password reset successfully' };
  }
  async resetPasswordManually(email: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password reset successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.name,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    };
  }
}
