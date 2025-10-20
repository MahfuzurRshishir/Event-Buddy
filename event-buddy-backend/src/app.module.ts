import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { Event } from './events/events.entity';
import { User } from './users/users.entity';
import { EventRegistration } from './events/events.reg.entity';
import { Booking } from './bookings/bookings.entity';
import { RolesGuard } from './auth/roles.guard';



@Module({
  imports: [
    ConfigModule.forRoot({
          // Set isGlobal to true to make ConfigModule available throughout the application
          isGlobal: true,
        }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, 
      entities: [User, Event, EventRegistration, Booking],
    }),
   AuthModule,
   UsersModule,
   EventsModule,
   BookingsModule,
        

  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard ],
})
export class AppModule {}
