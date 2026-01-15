import { Module } from "@nestjs/common";
import { DmController } from "./dm.controller";
import { DmService } from "./dm.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [DmController],
  providers: [DmService, PrismaService]
})
export class DmModule {}
