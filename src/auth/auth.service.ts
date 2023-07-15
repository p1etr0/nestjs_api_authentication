import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createCipheriv, createDecipheriv } from 'crypto';
import { CRYPTO_IV, CRYPTO_KEY } from '../@common/constants';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { SignDto } from './dto/sign.dto';
import { JwtData } from '../@common/guards/jwt-guard/types/jwt-data';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async sign(
    signDto: SignDto,
    options?: JwtSignOptions,
  ): Promise<{ token: string }> {
    const { email, password } = signDto;
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !user.active || !(await compare(password, user.password)))
      throw new UnauthorizedException(`Invalid credentials`);

    const encryptedPayload = this.encrypt(
      JSON.stringify({ id: user.id, email: user.email, active: user.active }),
      CRYPTO_KEY,
      CRYPTO_IV,
    );

    return {
      token: this.jwtService.sign(
        { data: encryptedPayload },
        {
          expiresIn: '8h',
          issuer: 'API_AUTHENTICATION',
          ...options,
        },
      ),
    };
  }

  async decode(authorization: string): Promise<JwtData> {
    const decryptedTokenString = this.decrypt(
      authorization,
      CRYPTO_IV,
      CRYPTO_KEY,
    );

    try {
      return JSON.parse(decryptedTokenString);
    } catch (e) {
      throw new BadRequestException(JSON.stringify(e));
    }
  }

  private encrypt(text: string, key: string, iv: string): string {
    const cipher = createCipheriv('aes-128-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  private decrypt(text: any, iv: string, key: string): string {
    const decipher = createDecipheriv('aes-128-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(Buffer.from(text, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
