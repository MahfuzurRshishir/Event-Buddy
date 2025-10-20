import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventRegistration } from '../events/events.reg.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  duration: string;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  capacity: number;

  @Column({ default: 0 })
  bookedSeats: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => EventRegistration, registration => registration.event)
  registrations: EventRegistration[];

  // Virtual field for available seats
  get availableSeats(): number {
    return this.capacity - this.bookedSeats;
  }

  // Virtual field to check if event is in the past
  get isPastEvent(): boolean {
    const today = new Date();
    const eventDate = new Date(this.eventDate);
    return eventDate < today;
  }

  // Virtual field to check if event is upcoming
  get isUpcomingEvent(): boolean {
    return !this.isPastEvent;
  }
}