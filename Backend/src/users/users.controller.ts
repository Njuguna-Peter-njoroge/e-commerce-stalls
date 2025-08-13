import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../jwt/jwt gurad';
import { RolesGuard } from '../Guards/roleguard';
import { Roles } from '../Guards/decortators/roles.decorator';
import { ChangePasswordDto } from './Dtos/changePassword.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply globally to all routes
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ----------------------------
  // CREATE USER (ADMIN ONLY)
  // ----------------------------
  @Post()
  @Roles(Role.MAIN_ADMIN)
  create(@Body() data: any) {
    return this.usersService.create(data);
  }

  // ----------------------------
  // GET USERS (ADMIN ONLY, PAGINATED)
  // ----------------------------
  @Get()
  @Roles(Role.MAIN_ADMIN)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  // ----------------------------
  // GET OWN PROFILE
  // ----------------------------
  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.userId);
  }

  // ----------------------------
  // GET SINGLE USER (ADMIN ONLY)
  // ----------------------------
  @Get(':id')
  @Roles(Role.MAIN_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // ----------------------------
  // GET USER BY EMAIL (ADMIN ONLY)
  // ----------------------------
  @Get('email/:email')
  @Roles(Role.MAIN_ADMIN)
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  // ----------------------------
  // UPDATE OWN PROFILE
  // ----------------------------
  @Patch('me')
  updateProfile(@Req() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.userId, data);
  }

  // ----------------------------
  // CHANGE ROLE (MAIN_ADMIN ONLY)
  // ----------------------------
  @Patch(':id/role')
  @Roles(Role.MAIN_ADMIN)
  changeRole(
    @Req() req,
    @Param('id') targetUserId: string,
    @Body('role') newRole: Role,
  ) {
    return this.usersService.changeRole(req.user.userId, targetUserId, newRole);
  }

  // ----------------------------
  // DELETE USER (MAIN_ADMIN ONLY)
  // ----------------------------
  @Delete(':id')
  @Roles(Role.MAIN_ADMIN)
  deleteUser(@Req() req, @Param('id') targetUserId: string) {
    return this.usersService.deleteUser(req.user.userId, targetUserId);
  }

  // ----------------------------
  // CHANGE PASSWORD (USER OR ADMIN)
  // ----------------------------
  @Patch(':id/password')
  async changePassword(
    @Req() req,
    @Param('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // Allow users to change their own password, or admins to change any user's password
    const isAdmin = req.user.role === Role.MAIN_ADMIN;
    const isOwnAccount = req.user.userId === userId;
    
    if (!isAdmin && !isOwnAccount) {
      throw new ForbiddenException('You can only change your own password');
    }

    return this.usersService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
