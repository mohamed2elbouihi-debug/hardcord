import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateChannelDto } from "./dto";

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(serverId: string, userId: string) {
    const membership = await this.prisma.serverMember.findFirst({ where: { serverId, userId } });
    if (!membership) {
      throw new ForbiddenException("Not a member");
    }
    return this.prisma.channel.findMany({
      where: { serverId },
      orderBy: { position: "asc" }
    });
  }

  async create(serverId: string, userId: string, payload: CreateChannelDto) {
    const membership = await this.prisma.serverMember.findFirst({ where: { serverId, userId } });
    if (!membership) {
      throw new ForbiddenException("Not a member");
    }

    return this.prisma.channel.create({
      data: {
        name: payload.name,
        type: payload.type,
        serverId,
        categoryId: payload.categoryId
      }
    });
  }
}
