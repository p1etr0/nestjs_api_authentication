import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JWT_SECRET } from '../../constants';
import { AuthService } from '../../../auth/auth.service';
import { JwtData } from './types/jwt-data';

const name = 'jwt-strategy';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, name) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(request: { data: string }): Promise<JwtData> {
    try {
      return this.authService.decode(request.data);
    } catch (error) {
      throw new ForbiddenException(
        `jwt payload could not be parsed or it was malformed`,
      );
    }
  }

  static getName(): string {
    return name;
  }
}
