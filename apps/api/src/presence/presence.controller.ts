import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { PresenceService } from "./presence.service";

@ApiTags("presence")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("presence")
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Patch("me")
  async update(@CurrentUser() user: { id: string }, @Body("status") status: string) {
    await this.presenceService.setStatus(user.id, status);
    return { status };
  }

  @Get(":userId")
  async get(@Param("userId") userId: string) {
    return this.presenceService.getStatus(userId);
  }
}
