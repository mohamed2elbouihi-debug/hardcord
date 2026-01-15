import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateInviteDto, CreateServerDto } from "./dto";
import crypto from "crypto";

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.server.findMany({
      where: { members: { some: { userId } } },
      include: { members: true }
    });
  }

  async create(userId: string, payload: CreateServerDto) {
    const server = await this.prisma.server.create({
      data: {
        name: payload.name,
        iconUrl: payload.iconUrl,
        bannerUrl: payload.bannerUrl,
        ownerId: userId,
        members: { create: { userId } },
        roles: {
          create: [
            { name: "Admin", position: 10, isDefault: false },
            { name: "Member", position: 1, isDefault: true }
          ]
        },
        categories: { create: { name: "General", position: 1 } }
      }
    });

    return server;
  }

  async leave(userId: string, serverId: string) {
    const membership = await this.prisma.serverMember.findFirst({
      where: { serverId, userId }
    });
    if (!membership) {
      throw new NotFoundException("Membership not found");
    }
    await this.prisma.serverMember.delete({ where: { id: membership.id } });
  }

  async joinByInvite(userId: string, code: string) {
    const invite = await this.prisma.invite.findUnique({ where: { code } });
    if (!invite) {
      throw new NotFoundException("Invite not found");
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ForbiddenException("Invite expired");
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new ForbiddenException("Invite maxed out");
    }

    await this.prisma.serverMember.upsert({
      where: { serverId_userId: { serverId: invite.serverId, userId } },
      update: {},
      create: { serverId: invite.serverId, userId }
    });

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } }
    });

    return this.prisma.server.findUnique({ where: { id: invite.serverId } });
  }

  async createInvite(userId: string, serverId: string, payload: CreateInviteDto) {
    const membership = await this.prisma.serverMember.findFirst({
      where: { serverId, userId }
    });
    if (!membership) {
      throw new ForbiddenException("Not a member");
    }

    const code = crypto.randomBytes(6).toString("hex");
    const expiresAt = payload.expiresInMinutes
      ? new Date(Date.now() + payload.expiresInMinutes * 60 * 1000)
      : null;

    return this.prisma.invite.create({
      data: {
        serverId,
        code,
        expiresAt,
        maxUses: payload.maxUses,
        createdById: userId
      }
    });
  }

  async kickMember(actorId: string, serverId: string, targetUserId: string) {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server || server.ownerId !== actorId) {
      throw new ForbiddenException("Insufficient permissions");
    }
    await this.prisma.serverMember.deleteMany({ where: { serverId, userId: targetUserId } });
  }

  async banMember(actorId: string, serverId: string, targetUserId: string, reason?: string) {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server || server.ownerId !== actorId) {
      throw new ForbiddenException("Insufficient permissions");
    }
    await this.prisma.serverBan.upsert({
      where: { serverId_userId: { serverId, userId: targetUserId } },
      update: { reason },
      create: { serverId, userId: targetUserId, reason }
    });
    await this.prisma.serverMember.deleteMany({ where: { serverId, userId: targetUserId } });
  }

  async muteMember(actorId: string, serverId: string, targetUserId: string, durationMinutes?: number) {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server || server.ownerId !== actorId) {
      throw new ForbiddenException("Insufficient permissions");
    }
    const mutedUntil = durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000) : null;
    await this.prisma.serverMember.updateMany({
      where: { serverId, userId: targetUserId },
      data: { mutedUntil }
    });
  }

  async timeoutMember(actorId: string, serverId: string, targetUserId: string, durationMinutes?: number) {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server || server.ownerId !== actorId) {
      throw new ForbiddenException("Insufficient permissions");
    }
    const timeoutUntil = durationMinutes ? new Date(Date.now() + durationMinutes * 60 * 1000) : null;
    await this.prisma.serverMember.updateMany({
      where: { serverId, userId: targetUserId },
      data: { timeoutUntil }
    });
  }
}
