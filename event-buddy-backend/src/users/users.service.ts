import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  //logic and security add korte hbe 
  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  //logic and security add korte hbe password jeno na dekhay
  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Valid email must be provided');
    }
  
    const sanitizedEmail = email.trim().toLowerCase();
  
    const user = await this.usersRepository.findOne({ where: { email: sanitizedEmail } });
  
    if (!user) {
      throw new NotFoundException(`User with email "${sanitizedEmail}" not found`);
    }
  
    return user;
  }
}
