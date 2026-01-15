import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { CreateChannelDto } from "./dto";
import { ChannelsService } from "./channels.service";

@ApiTags("channels")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get("server/:serverId")
  list(@Param("serverId") serverId: string, @CurrentUser() user: { id: string }) {
    return this.channelsService.list(serverId, user.id);
  }

  @Post("server/:serverId")
  create(
    @Param("serverId") serverId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateChannelDto
  ) {
    return this.channelsService.create(serverId, user.id, dto);
  }
}
