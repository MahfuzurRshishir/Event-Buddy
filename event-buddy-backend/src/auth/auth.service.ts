import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Register a new user
  async register(dto: CreateUserDto) {
    //console.log('Registering user in service:', email, password, fullName);
    const { email, password, fullName, role } = dto;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    try {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepo.create({
        email,
        password: hashedPassword,
        fullName,
        role: (role as 'USER' | 'ADMIN') || 'USER',
      });
      return await this.userRepo.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new UnauthorizedException(
        'Failed to create user. Please try again later.',
      );
    }
  }

  // Login a user and return a JWT token
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, fullname: user.fullName, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
