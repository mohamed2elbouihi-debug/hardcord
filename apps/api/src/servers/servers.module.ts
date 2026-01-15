import { Module } from "@nestjs/common";
import { ServersController } from "./servers.controller";
import { ServersService } from "./servers.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [ServersController],
  providers: [ServersService, PrismaService]
})
export class ServersModule {}
