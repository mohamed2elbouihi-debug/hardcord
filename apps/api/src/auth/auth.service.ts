import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../common/prisma.service";
import { EmailService } from "../common/email.service";
import argon2 from "argon2";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  private signAccessToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "15m"
      }
    );
  }

  private signRefreshToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "7d"
      }
    );
  }

  async register(payload: { email: string; username: string; displayName: string; password: string }) {
    const passwordHash = await argon2.hash(payload.password);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        displayName: payload.displayName,
        passwordHash
      }
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await argon2.hash(token);
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });

    await this.emailService.sendVerificationEmail(user.email, token);

    return { userId: user.id };
  }

  async verifyEmail(token: string) {
    const tokens = await this.prisma.verificationToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: true }
    });

    const matched = await Promise.all(
      tokens.map(async (item) => (await argon2.verify(item.tokenHash, token)) ? item : null)
    );

    const valid = matched.find(Boolean);
    if (!valid) {
      throw new UnauthorizedException("Invalid token");
    }

    await this.prisma.user.update({
      where: { id: valid.userId },
      data: { emailVerifiedAt: new Date() }
    });

    await this.prisma.verificationToken.delete({ where: { id: valid.id } });
  }

  async login(payload: { email: string; password: string }, meta: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await argon2.verify(user.passwordHash, payload.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    const refreshTokenHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        ipAddress: meta.ip,
        userAgent: meta.userAgent
      }
    });

    return { accessToken, refreshToken, userId: user.id };
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException("Invalid Google token");
    }

    const email = payload.email;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    const user =
      existing ??
      (await this.prisma.user.create({
        data: {
          email,
          passwordHash: await argon2.hash(crypto.randomBytes(16).toString("hex")),
          username: payload.email.split("@")[0],
          displayName: payload.name ?? payload.email.split("@")[0],
          avatarUrl: payload.picture ?? undefined,
          emailVerifiedAt: new Date()
        }
      }));

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    const refreshTokenHash = await argon2.hash(refreshToken);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash
      }
    });

    return { accessToken, refreshToken, userId: user.id };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const sessions = await this.prisma.session.findMany({
        where: { userId: payload.sub, revokedAt: null }
      });

      const sessionMatch = await Promise.all(
        sessions.map(async (session) => (await argon2.verify(session.refreshTokenHash, refreshToken)) ? session : null)
      );

      const session = sessionMatch.find(Boolean);
      if (!session) {
        throw new UnauthorizedException("Invalid session");
      }

      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });

      const newAccessToken = this.signAccessToken(payload.sub);
      const newRefreshToken = this.signRefreshToken(payload.sub);
      const newRefreshHash = await argon2.hash(newRefreshToken);

      await this.prisma.session.create({
        data: { userId: payload.sub, refreshTokenHash: newRefreshHash }
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null }
    });

    for (const session of sessions) {
      const match = await argon2.verify(session.refreshTokenHash, refreshToken);
      if (match) {
        await this.prisma.session.update({
          where: { id: session.id },
          data: { revokedAt: new Date() }
        });
      }
    }
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, createdAt: true, ipAddress: true, userAgent: true }
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) {
      throw new UnauthorizedException("Session not found");
    }
    await this.prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await argon2.hash(token);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });

    await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: { expiresAt: { gt: new Date() } }
    });

    const matched = await Promise.all(
      tokens.map(async (item) => (await argon2.verify(item.tokenHash, token)) ? item : null)
    );

    const valid = matched.find(Boolean);
    if (!valid) {
      throw new UnauthorizedException("Invalid token");
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: valid.userId },
      data: { passwordHash }
    });

    await this.prisma.passwordResetToken.delete({ where: { id: valid.id } });
  }
}
