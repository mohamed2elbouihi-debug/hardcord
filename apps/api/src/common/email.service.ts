import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      : undefined
  });

  async sendVerificationEmail(email: string, token: string) {
    if (!process.env.SMTP_HOST) {
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@hardcord.local",
      to: email,
      subject: "Verify your Hardcord account",
      text: `Verify your account: ${process.env.APP_URL}/verify-email?token=${token}`
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!process.env.SMTP_HOST) {
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@hardcord.local",
      to: email,
      subject: "Reset your Hardcord password",
      text: `Reset your password: ${process.env.APP_URL}/reset-password?token=${token}`
    });
  }
}
