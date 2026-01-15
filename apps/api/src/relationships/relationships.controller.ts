import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { BlockDto, FriendRequestDto, FriendResponseDto } from "./dto";
import { RelationshipsService } from "./relationships.service";

@ApiTags("relationships")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("relationships")
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Get("friend-requests")
  listRequests(@CurrentUser() user: { id: string }) {
    return this.relationshipsService.listFriendRequests(user.id);
  }

  @Post("friend-requests")
  sendRequest(@CurrentUser() user: { id: string }, @Body() dto: FriendRequestDto) {
    return this.relationshipsService.sendFriendRequest(user.id, dto.userId);
  }

  @Post("friend-requests/:id")
  respondRequest(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() dto: FriendResponseDto
  ) {
    return this.relationshipsService.respondRequest(user.id, id, dto.status);
  }

  @Post("blocks")
  block(@CurrentUser() user: { id: string }, @Body() dto: BlockDto) {
    return this.relationshipsService.block(user.id, dto.userId);
  }

  @Post("blocks/:userId/unblock")
  unblock(@CurrentUser() user: { id: string }, @Param("userId") userId: string) {
    return this.relationshipsService.unblock(user.id, userId);
  }
}
