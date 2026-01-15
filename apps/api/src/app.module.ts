import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nestjs/throttler-storage-redis";
import { PrismaService } from "./common/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ServersModule } from "./servers/servers.module";
import { ChannelsModule } from "./channels/channels.module";
import { MessagesModule } from "./messages/messages.module";
import { PresenceModule } from "./presence/presence.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { HealthModule } from "./health/health.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { FilesModule } from "./files/files.module";
import { DmModule } from "./dm/dm.module";
import { RelationshipsModule } from "./relationships/relationships.module";
import { LinksModule } from "./links/links.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: 60,
        limit: 120,
        storage: new ThrottlerStorageRedisService(process.env.REDIS_URL ?? "redis://localhost:6379")
      })
    }),
    AuthModule,
    UsersModule,
    ServersModule,
    ChannelsModule,
    MessagesModule,
    PresenceModule,
    NotificationsModule,
    HealthModule,
    RealtimeModule,
    FilesModule,
    DmModule,
    RelationshipsModule,
    LinksModule
  ],
  providers: [PrismaService]
})
export class AppModule {}
