import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventRegistration } from '../events/events.reg.entity';
import { User } from '../users/users.entity';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRegistration, User]),
    AuthModule
  ],

  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}