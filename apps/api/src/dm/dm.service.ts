import { ForbiddenException, Injectable } from "@nestjs/common";
import { ChannelType } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DmService {
  constructor(private readonly prisma: PrismaService) {}

  async open(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ForbiddenException("Cannot DM yourself");
    }

    const existing = await this.prisma.channel.findFirst({
      where: {
        type: ChannelType.DM,
        AND: [
          { dmParticipants: { some: { userId } } },
          { dmParticipants: { some: { userId: targetUserId } } }
        ]
      }
    });

    if (existing) {
      return existing;
    }

    const channel = await this.prisma.channel.create({
      data: {
        name: `${userId}-${targetUserId}`,
        type: ChannelType.DM,
        dmParticipants: {
          create: [{ userId }, { userId: targetUserId }]
        }
      }
    });

    return channel;
  }

  async list(userId: string) {
    return this.prisma.channel.findMany({
      where: { type: ChannelType.DM, dmParticipants: { some: { userId } } },
      include: { dmParticipants: true }
    });
  }
}
