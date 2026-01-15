import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";
import { EmailService } from "../common/email.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, EmailService],
  exports: [AuthService]
})
export class AuthModule {}
