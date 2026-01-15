import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { CreateMessageDto, EditMessageDto, ReactionDto } from "./dto";
import { MessagesService } from "./messages.service";

@ApiTags("messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("channel/:channelId")
  list(
    @Param("channelId") channelId: string,
    @CurrentUser() user: { id: string },
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string
  ) {
    return this.messagesService.list(channelId, user.id, cursor, limit ? Number(limit) : 50);
  }

  @Post("channel/:channelId")
  create(
    @Param("channelId") channelId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMessageDto
  ) {
    return this.messagesService.create(channelId, user.id, dto.content);
  }

  @Patch(":messageId")
  edit(@Param("messageId") messageId: string, @CurrentUser() user: { id: string }, @Body() dto: EditMessageDto) {
    return this.messagesService.edit(messageId, user.id, dto.content);
  }

  @Delete(":messageId")
  remove(@Param("messageId") messageId: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.remove(messageId, user.id);
  }

  @Post(":messageId/pin")
  pin(@Param("messageId") messageId: string, @CurrentUser() user: { id: string }) {
    return this.messagesService.pin(messageId, user.id);
  }

  @Post(":messageId/reactions")
  react(@Param("messageId") messageId: string, @CurrentUser() user: { id: string }, @Body() dto: ReactionDto) {
    return this.messagesService.react(messageId, user.id, dto.emoji);
  }

  @Delete(":messageId/reactions/:emoji")
  removeReaction(
    @Param("messageId") messageId: string,
    @Param("emoji") emoji: string,
    @CurrentUser() user: { id: string }
  ) {
    return this.messagesService.removeReaction(messageId, user.id, emoji);
  }
}
