import { Module } from "@nestjs/common";
import { RelationshipsController } from "./relationships.controller";
import { RelationshipsService } from "./relationships.service";
import { PrismaService } from "../common/prisma.service";

@Module({
  controllers: [RelationshipsController],
  providers: [RelationshipsService, PrismaService]
})
export class RelationshipsModule {}
