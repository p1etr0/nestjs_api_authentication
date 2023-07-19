import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 } from 'uuid';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../@common/mail/mail.service';
import { ActivateDto } from './dto/activate.dto';
import { PrismaService } from '../@common/infra/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly mailService: MailService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, telephone } = createUserDto;
    const userAlreadyExists = await this.prismaService.user.findFirst({
      where: { OR: [{ email }, { telephone }] },
    });

    if (userAlreadyExists) throw new ConflictException(`User already exists`);

    const confirmationCode = await this.generateConfirmationCode();

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: await hash(password, 10),
        telephone,
        id: v4(),
        active: false,
        confirmationCode,
      },
    });

    try {
      await this.mailService.send(
        email,
        `Ativação de conta`,
        `Ative sua conta\n Código: ${confirmationCode}`,
      );
    } catch (e: any) {
      console.log(`E-mail not sent - ${JSON.stringify(e)}`);
    }

    return { id: user.id, active: user.active };
  }

  async activate(id: string, activateDto: ActivateDto) {
    const user = await this.findOneById(id);

    if (user.confirmationCode !== activateDto.confirmationCode)
      throw new BadRequestException(`Wrong confirmation code`);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { active: true },
    });

    return { id: user.id, active: true };
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOneById(id: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException(`Not found user ${id}`);

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) return null;

    return user;
  }

  private async generateConfirmationCode(codeLength = 4) {
    const code = randomBytes(codeLength).toString('hex');

    const codeAlreadyExists = await this.prismaService.user.findFirst({
      where: { confirmationCode: code },
    });

    if (codeAlreadyExists) this.generateConfirmationCode();

    return code;
  }
}
