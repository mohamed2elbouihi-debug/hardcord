import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { UpdateProfileDto, UpdateStatusDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        status: true,
        customStatus: true
      }
    });
  }

  async updateProfile(userId: string, payload: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true
      }
    });
  }

  async updateStatus(userId: string, payload: UpdateStatusDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: payload.status,
        customStatus: payload.customStatus
      },
      select: { id: true, status: true, customStatus: true }
    });
  }
}
