import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './@common/mail/mail.module';
import { PrismaModule } from './@common/infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config.validation';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MailModule,
    PrismaModule,
    ConfigModule.forRoot({ validate }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
