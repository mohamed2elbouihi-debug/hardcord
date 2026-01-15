import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing token");
    }
    const token = authHeader.split(" ")[1];
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
      (request as Request & { user?: { id: string; permissions?: bigint } }).user = {
        id: payload.sub,
        permissions: payload.permissions ?? 0n
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
