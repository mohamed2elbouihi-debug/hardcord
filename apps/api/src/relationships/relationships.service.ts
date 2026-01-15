import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class RelationshipsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendFriendRequest(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new ForbiddenException("Cannot friend yourself");
    }

    return this.prisma.friendRequest.create({
      data: { requesterId: userId, recipientId }
    });
  }

  async respondRequest(userId: string, requestId: string, status: "ACCEPTED" | "DECLINED") {
    return this.prisma.friendRequest.update({
      where: { id: requestId, recipientId: userId },
      data: { status }
    });
  }

  async listFriendRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { recipientId: userId }
    });
  }

  async block(userId: string, blockedId: string) {
    if (userId === blockedId) {
      throw new ForbiddenException("Cannot block yourself");
    }

    return this.prisma.block.create({
      data: { blockerId: userId, blockedId }
    });
  }

  async unblock(userId: string, blockedId: string) {
    return this.prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: userId, blockedId } }
    });
  }
}
