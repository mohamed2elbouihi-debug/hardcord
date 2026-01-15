import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { FilesService } from "./files.service";

@ApiTags("files")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("uploads")
  async createUpload(@Body("filename") filename: string, @Body("contentType") contentType: string) {
    const allowed = ["image/", "video/", "audio/", "application/pdf"];
    const isAllowed = allowed.some((prefix) => contentType.startsWith(prefix));
    if (!isAllowed) {
      throw new BadRequestException("Unsupported file type");
    }
    const key = `${Date.now()}-${filename}`;
    return this.filesService.createUploadUrl(key, contentType);
  }
}
