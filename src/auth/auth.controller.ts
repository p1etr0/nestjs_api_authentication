import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignDto } from './dto/sign.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async sign(@Body() signDto: SignDto) {
    return await this.authService.sign(signDto);
  }
}
