import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import Redis from "ioredis";

@WebSocketGateway({ cors: { origin: process.env.APP_URL } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly jwtService: JwtService) {}

  private redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

  private async checkRateLimit(userId: string, action: string, limit = 20, windowSec = 5) {
    const key = `ratelimit:${action}:${userId}`;
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, windowSec);
    }
    return current <= limit;
  }

  handleConnection(client: Socket) {
    client.emit("auth:connect", { status: "ready" });
  }

  handleDisconnect(client: Socket) {
    client.emit("presence:update", { status: "offline" });
  }

  @SubscribeMessage("auth:connect")
  onAuth(@MessageBody() data: { token: string }, @ConnectedSocket() client: Socket) {
    try {
      const payload = this.jwtService.verify(data.token, { secret: process.env.JWT_ACCESS_SECRET });
      client.data.userId = payload.sub;
      client.emit("auth:connect", { status: "ok", userId: payload.sub });
    } catch {
      client.emit("auth:connect", { status: "error" });
    }
  }

  @SubscribeMessage("presence:update")
  async onPresence(@MessageBody() data: { status: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    const allowed = await this.checkRateLimit(client.data.userId, "presence:update", 10, 10);
    if (!allowed) {
      return { event: "rate:limited", data: { action: "presence:update" } };
    }
    client.broadcast.emit("presence:update", { userId: client.data.userId, status: data.status });
  }

  @SubscribeMessage("typing:start")
  async onTypingStart(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    const allowed = await this.checkRateLimit(client.data.userId, "typing:start", 30, 10);
    if (!allowed) {
      return { event: "rate:limited", data: { action: "typing:start" } };
    }
    client.broadcast.emit("typing:start", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("typing:stop")
  async onTypingStop(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("typing:stop", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("message:send")
  async onMessageSend(@MessageBody() data: { channelId: string; messageId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    const allowed = await this.checkRateLimit(client.data.userId, "message:send", 20, 5);
    if (!allowed) {
      return { event: "rate:limited", data: { action: "message:send" } };
    }
    client.broadcast.emit("message:send", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("message:edit")
  async onMessageEdit(@MessageBody() data: { messageId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("message:edit", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("message:delete")
  async onMessageDelete(@MessageBody() data: { messageId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("message:delete", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("message:reaction:add")
  async onReactionAdd(@MessageBody() data: { messageId: string; emoji: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("message:reaction:add", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("message:reaction:remove")
  async onReactionRemove(@MessageBody() data: { messageId: string; emoji: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("message:reaction:remove", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("channel:join")
  async onChannelJoin(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.join(data.channelId);
    client.broadcast.emit("channel:join", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("channel:leave")
  async onChannelLeave(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.leave(data.channelId);
    client.broadcast.emit("channel:leave", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("dm:open")
  async onDmOpen(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("dm:open", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("notification:new")
  async onNotificationNew(@MessageBody() data: { notificationId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("notification:new", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("server:member:update")
  async onMemberUpdate(@MessageBody() data: { serverId: string; memberId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("server:member:update", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("role:update")
  async onRoleUpdate(@MessageBody() data: { roleId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("role:update", { ...data, userId: client.data.userId });
  }

  @SubscribeMessage("channel:update")
  async onChannelUpdate(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return;
    }
    client.broadcast.emit("channel:update", { ...data, userId: client.data.userId });
  }
}
