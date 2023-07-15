import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { IS_PUBLIC } from '../../../@common/constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtGuard extends AuthGuard(JwtStrategy.getName()) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
