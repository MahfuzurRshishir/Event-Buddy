import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../users/users.entity';
import { Event } from './events.entity';

@Entity()
@Unique(['user', 'event'])
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.registrations, { eager: true })
  user: User;

  @ManyToOne(() => Event, event => event.registrations, { eager: true })
  event: Event;
}