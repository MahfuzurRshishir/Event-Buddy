import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //user na thkle ki respnse korbe seta handle korte hbe
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  //user na thkle ki respnse korbe seta handle korte hbe
  @Get('id/:id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.findOne(Number(id));
  }

  //user na thkle ki respnse korbe seta handle korte hbe
  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return await this.usersService.findByEmail(email);
  }
}
