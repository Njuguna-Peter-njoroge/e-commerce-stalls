import {Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {StallService} from "./stall.service";
import {CreateStallDto} from "./Dtos/createstall.dto";
import {RolesGuard} from "../Guards/roleguard";
import {JwtAuthGuard} from "../jwt/jwt gurad";
import {Roles} from "../Guards/decortators/roles.decorator";
import {Role} from "@prisma/client";

@Controller('stall')
export class StallController {
    constructor(private  readonly stallService:StallService) {
    }
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MAIN_ADMIN, Role.STALL_ADMIN)
    @Post()
    create(@Body() createStallDto: CreateStallDto, @Req() req) {
        return this.stallService.createStall(createStallDto, req.user);
    }

@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MAIN_ADMIN)
    findAll() {
        return this.stallService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.stallService.findOne(id );
    }
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MAIN_ADMIN, Role.STALL_ADMIN)
    async update(@Param('id') id: string, @Body() updateStallDto: CreateStallDto, @Req() req) {
        return this.stallService.update(id, updateStallDto, req.user);
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.MAIN_ADMIN, Role.STALL_ADMIN)
    @Get(':id/delete')
    async remove(@Param('id') id: string, @Req() req) {
        return this.stallService.remove(id, req.user);
    }
}
