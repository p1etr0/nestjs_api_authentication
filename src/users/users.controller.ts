import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtGuard } from '../@common/guards/jwt-guard/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { ActivateDto } from './dto/activate.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Throttle(2, 60)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Throttle(2, 60)
  @Post('/:id/activate')
  activate(@Param('id') id: string, @Body() activateDto: ActivateDto) {
    return this.usersService.activate(id, activateDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }
}
