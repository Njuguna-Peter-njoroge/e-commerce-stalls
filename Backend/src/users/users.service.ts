import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE USER
  // ----------------------------
  async create(data: Prisma.UserCreateInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // Don't return password
    const { password, ...result } = user;
    return result;
  }

  // ----------------------------
  // FIND ALL USERS (PAGINATED)
  // ----------------------------
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ----------------------------
  // FIND SINGLE USER
  // ----------------------------
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ----------------------------
  // FIND USER BY EMAIL
  // ----------------------------
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ----------------------------
  // UPDATE USER PROFILE (SELF)
  // ----------------------------
  async updateProfile(userId: string, data: Partial<Prisma.UserUpdateInput>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const { password, ...result } = updated;
    return result;
  }

  // ----------------------------
  // CHANGE ROLE (ADMIN ONLY)
  // ----------------------------
  async changeRole(adminId: string, targetUserId: string, newRole: Role) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.MAIN_ADMIN) {
      throw new ForbiddenException('Only MAIN_ADMIN can change roles');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    const { password, ...result } = updated;
    return result;
  }

  // ----------------------------
  // CHANGE PASSWORD (USER OR ADMIN)
  // ----------------------------
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    const { password, ...result } = updated;
    return result;
  }

  // ----------------------------
  // DELETE USER (ADMIN ONLY)
  // ----------------------------
  async deleteUser(adminId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== Role.MAIN_ADMIN) {
      throw new ForbiddenException('Only MAIN_ADMIN can delete users');
    }

    return this.prisma.user.delete({
      where: { id: targetUserId },
    });
  }
}
