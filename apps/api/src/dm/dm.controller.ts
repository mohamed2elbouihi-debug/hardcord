import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { CurrentUser } from "../auth/user.decorator";
import { DmService } from "./dm.service";

@ApiTags("dm")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dm")
export class DmController {
  constructor(private readonly dmService: DmService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.dmService.list(user.id);
  }

  @Post("open")
  open(@CurrentUser() user: { id: string }, @Body("userId") userId: string) {
    return this.dmService.open(user.id, userId);
  }
}
