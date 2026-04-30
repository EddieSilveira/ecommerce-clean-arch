import { IEmailNotifier } from "@application/ports/email-notifier";
import * as nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class NodemailerEmailNotifier implements IEmailNotifier {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      auth: { user: config.user, pass: config.pass },
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: email,
      subject: "Password Reset",
      text: `Your password reset token: ${token}`,
      html: `<p>Your password reset token: <strong>${token}</strong></p>`,
    });
  }
}
