import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    return await this.mailerService.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
    });
  }
}
