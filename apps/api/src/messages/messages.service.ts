import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(channelId: string, userId: string, cursor?: string, limit = 50) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    if (channel.serverId) {
      const membership = await this.prisma.serverMember.findFirst({
        where: { serverId: channel.serverId, userId }
      });
      if (!membership) {
        throw new ForbiddenException("Not a member");
      }
    }

    return this.prisma.message.findMany({
      where: { channelId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });
  }

  async create(channelId: string, userId: string, content: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundException("Channel not found");
    }
    if (channel.serverId) {
      const membership = await this.prisma.serverMember.findFirst({
        where: { serverId: channel.serverId, userId }
      });
      if (!membership) {
        throw new ForbiddenException("Not a member");
      }
    }

    const sanitized = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
    return this.prisma.message.create({
      data: {
        channelId,
        authorId: userId,
        content: sanitized
      }
    });
  }

  async edit(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    if (message.authorId !== userId) {
      throw new ForbiddenException("Not allowed");
    }

    const sanitized = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: sanitized, editedAt: new Date() }
    });
  }

  async remove(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    if (message.authorId !== userId) {
      throw new ForbiddenException("Not allowed");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() }
    });
  }

  async pin(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    if (message.authorId !== userId) {
      throw new ForbiddenException("Not allowed");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { pinnedAt: new Date() }
    });
  }

  async react(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      update: {},
      create: { messageId, userId, emoji }
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.delete({
      where: { messageId_userId_emoji: { messageId, userId, emoji } }
    });
  }
}
