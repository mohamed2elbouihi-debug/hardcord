import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class PresenceService {
  private redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

  async setStatus(userId: string, status: string) {
    await this.redis.hset(`presence:${userId}`, { status, updatedAt: Date.now().toString() });
  }

  async getStatus(userId: string) {
    return this.redis.hgetall(`presence:${userId}`);
  }
}
