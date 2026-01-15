import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ChannelType } from "@prisma/client";

export class CreateChannelDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsEnum(ChannelType)
  type!: ChannelType;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
