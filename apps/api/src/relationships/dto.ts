import { IsIn, IsString } from "class-validator";

export class FriendRequestDto {
  @IsString()
  userId!: string;
}

export class FriendResponseDto {
  @IsIn(["ACCEPTED", "DECLINED"])
  status!: "ACCEPTED" | "DECLINED";
}

export class BlockDto {
  @IsString()
  userId!: string;
}
