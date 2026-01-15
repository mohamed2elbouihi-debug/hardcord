import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateServerDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;
}

export class CreateInviteDto {
  @IsOptional()
  @IsInt()
  maxUses?: number;

  @IsOptional()
  @IsInt()
  expiresInMinutes?: number;
}

export class ModerationDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;
}
