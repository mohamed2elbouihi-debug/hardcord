import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { CreateInviteDto, CreateServerDto, ModerationDto } from "./dto";
import { ServersService } from "./servers.service";

@ApiTags("servers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("servers")
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.serversService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateServerDto) {
    return this.serversService.create(user.id, dto);
  }

  @Post(":serverId/leave")
  leave(@CurrentUser() user: { id: string }, @Param("serverId") serverId: string) {
    return this.serversService.leave(user.id, serverId);
  }

  @Post("invite/:code")
  joinByInvite(@CurrentUser() user: { id: string }, @Param("code") code: string) {
    return this.serversService.joinByInvite(user.id, code);
  }

  @Post(":serverId/invites")
  createInvite(
    @CurrentUser() user: { id: string },
    @Param("serverId") serverId: string,
    @Body() dto: CreateInviteDto
  ) {
    return this.serversService.createInvite(user.id, serverId, dto);
  }

  @Post(":serverId/kick")
  kick(
    @CurrentUser() user: { id: string },
    @Param("serverId") serverId: string,
    @Body() dto: ModerationDto
  ) {
    return this.serversService.kickMember(user.id, serverId, dto.userId);
  }

  @Post(":serverId/ban")
  ban(
    @CurrentUser() user: { id: string },
    @Param("serverId") serverId: string,
    @Body() dto: ModerationDto
  ) {
    return this.serversService.banMember(user.id, serverId, dto.userId, dto.reason);
  }

  @Post(":serverId/mute")
  mute(
    @CurrentUser() user: { id: string },
    @Param("serverId") serverId: string,
    @Body() dto: ModerationDto
  ) {
    return this.serversService.muteMember(user.id, serverId, dto.userId, dto.durationMinutes);
  }

  @Post(":serverId/timeout")
  timeout(
    @CurrentUser() user: { id: string },
    @Param("serverId") serverId: string,
    @Body() dto: ModerationDto
  ) {
    return this.serversService.timeoutMember(user.id, serverId, dto.userId, dto.durationMinutes);
  }
}
