import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}

export class EditMessageDto {
  @IsString()
  @MaxLength(2000)
  content!: string;
}

export class ReactionDto {
  @IsString()
  @MaxLength(64)
  emoji!: string;
}

export class ThreadDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}
