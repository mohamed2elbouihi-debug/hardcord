import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { EmailDto, LoginDto, RegisterDto, ResetPasswordDto, RefreshDto } from "./dto";
import { JwtAuthGuard } from "./jwt.guard";
import { CurrentUser } from "./user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("verify-email")
  async verifyEmail(@Body("token") token: string) {
    await this.authService.verifyEmail(token);
    return { success: true };
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined
    });
  }

  @Post("google")
  async googleLogin(@Body("idToken") idToken: string) {
    return this.authService.googleLogin(idToken);
  }

  @Get("csrf")
  csrf(@Req() req: Request & { csrfToken: () => string }) {
    return { csrfToken: req.csrfToken() };
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("logout")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Body() dto: RefreshDto, @CurrentUser() user: { id: string }) {
    await this.authService.logout(user.id, dto.refreshToken);
    return { success: true };
  }

  @Get("sessions")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async sessions(@CurrentUser() user: { id: string }) {
    return this.authService.listSessions(user.id);
  }

  @Post("sessions/revoke")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async revokeSession(@CurrentUser() user: { id: string }, @Body("sessionId") sessionId: string) {
    await this.authService.revokeSession(user.id, sessionId);
    return { success: true };
  }

  @Post("password-reset")
  async requestPasswordReset(@Body() dto: EmailDto) {
    await this.authService.requestPasswordReset(dto.email);
    return { success: true };
  }

  @Post("password-reset/confirm")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }
}
