import {ForbiddenException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {CreateStallDto} from "./Dtos/createstall.dto";
import {Role, Prisma, User} from "@prisma/client";


type SafeUser = Omit<User, 'password' | 'verificationToken'>;

@Injectable()
export class StallService {
    constructor(private prisma: PrismaService){}


    async createStall(createStallDto: CreateStallDto, user:SafeUser){
        if (user.role !== Role.MAIN_ADMIN && user.role !== Role.STALL_ADMIN) {
            throw new ForbiddenException('Only MAIN_ADMIN or STALL_ADMIN can create stalls');

        }
        if (user.role === Role.STALL_ADMIN){
            createStallDto.ownerId = user.id;
        }
        return this.prisma.stall.create({data: createStallDto});
  }
    async findAll() {
        return this.prisma.stall.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true } },
                products: true,
            },
        });
    }
async findOne(id: string) {
        return this.prisma.stall.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true } },
                products: true,
            }
        })
}
async update(id:string, updateStallDto: CreateStallDto, user:SafeUser) {
        const stall = await this.prisma.stall.findUnique({where: {id: id}});
        if (!stall) {
            throw new ForbiddenException('Stall not found');
        }
        return this.prisma.stall.update({
            where: {id: id},
            data: {
                name: updateStallDto.name,
                location: updateStallDto.location,
                ownerId: updateStallDto.ownerId,
            }
        })
}
async remove(id: string, user:SafeUser) {
     const stall = await this.prisma.stall.findUnique({where: {id: id}});
     if(!stall) throw new ForbiddenException('Stall not found');

     if(user.role !== Role.MAIN_ADMIN && stall.ownerId !== user.id){
         throw new ForbiddenException('Only MAIN_ADMIN or STALL_ADMIN can delete stalls');
    }
     return this.prisma.stall.delete({where: {id: id}});
}

}
