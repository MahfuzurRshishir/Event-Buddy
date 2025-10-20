import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './events.entity';
import { EventRegistration } from '../events/events.reg.entity';
import { User } from '../users/users.entity';


@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(EventRegistration)
        private registrationRepository: Repository<EventRegistration>,
    ) { }

    findAll(): Promise<Event[]> {
        //console.log('Fetching all events in service');
        return this.eventsRepository.find();
    }

    findOne(id: number): Promise<Event | null> {
        return this.eventsRepository.findOneBy({ id });
    }

    async create(createEventDto: any): Promise<Event> {
        //console.log('Creating event in service:', createEventDto);
        try {
            // Convert eventDate string to Date object
            const eventData = {
                ...createEventDto,
                eventDate: new Date(createEventDto.eventDate)
            };
            
            const savedEvent = await this.eventsRepository.save(eventData);
            return savedEvent;
        } catch (error) {
            console.error('Error creating event:', error);
            throw new BadRequestException('Failed to create event');
        }
    }

    async update(id: number, updateEventDto: any): Promise<Event> {
        try {
            // Convert eventDate string to Date object if provided
            const eventData = { ...updateEventDto };
            if (updateEventDto.eventDate) {
                eventData.eventDate = new Date(updateEventDto.eventDate);
            }
            
            await this.eventsRepository.update(id, eventData);
            const updatedEvent = await this.findOne(id);
            if (!updatedEvent) {
                throw new NotFoundException(`Event with id ${id} not found`);
            }
            return updatedEvent;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating event:', error);
            throw new BadRequestException('Failed to update event');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            await this.eventsRepository.delete(id);
        } catch (error: any) {
            // Handle FK constraint error when event has related bookings
            if (error?.code === '23503') {
                throw new BadRequestException('Event is on booking, can\'t delete');
            }
            throw error;
        }
    }

    async registerUser(eventId: number, user: User): Promise<EventRegistration> {
        const event = await this.findOne(eventId);
        if (!event) throw new NotFoundException('Event not found');

        // Check if already registered
        const existing = await this.registrationRepository.findOneBy({ event: { id: eventId }, user: { id: user.id } });
        if (existing) throw new BadRequestException('Already registered');

        // Check capacity
        const count = await this.registrationRepository.count({ where: { event: { id: eventId } } });
        if (count >= event.capacity) throw new BadRequestException('Event is full');

        const registration = this.registrationRepository.create({ event, user });
        return this.registrationRepository.save(registration);
    }

    async cancelRegistration(eventId: number, user: User): Promise<void> {
        const registration = await this.registrationRepository.findOneBy({ event: { id: eventId }, user: { id: user.id } });
        if (!registration) throw new NotFoundException('Registration not found');
        await this.registrationRepository.remove(registration);
    }

    async getUserRegistrations(user: User): Promise<EventRegistration[]> {
        return this.registrationRepository.find({ where: { user: { id: user.id } }, relations: ['event'] });
    }



    async getPaginatedEvents(page: number = 1, limit: number = 10, dateFilter?: 'upcoming' | 'previous') {
        const qb = this.eventsRepository.createQueryBuilder('event');

        // Date-based filtering using the new eventDate field
        if (dateFilter === 'upcoming') {
            qb.where('event.eventDate >= :now', { now: new Date().toISOString().slice(0, 10) });
        } else if (dateFilter === 'previous') {
            qb.where('event.eventDate < :now', { now: new Date().toISOString().slice(0, 10) });
        }

        // Only show active events
        qb.andWhere('event.isActive = :isActive', { isActive: true });

        qb.skip((page - 1) * limit)
            .take(limit)
            .orderBy('event.eventDate', 'ASC');

        const [data, total] = await qb.getManyAndCount();
        return {
            events: data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async updateImage(eventId: number, imageUrl: string) {
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');
        event.imageUrl = imageUrl;
        return this.eventsRepository.save(event);
    }

    // Update booked seats count when a booking is made
    async updateBookedSeats(eventId: number, seatsToAdd: number) {
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');
        
        event.bookedSeats += seatsToAdd;
        if (event.bookedSeats > event.capacity) {
            throw new BadRequestException('Cannot exceed event capacity');
        }
        
        return this.eventsRepository.save(event);
    }

    // Update booked seats count when a booking is cancelled
    async decreaseBookedSeats(eventId: number, seatsToRemove: number) {
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');
        
        event.bookedSeats = Math.max(0, event.bookedSeats - seatsToRemove);
        return this.eventsRepository.save(event);
    }

    // Get event statistics for admin dashboard
    async getEventStatistics() {
        const totalEvents = await this.eventsRepository.count();
        const activeEvents = await this.eventsRepository.count({ where: { isActive: true } });
        const upcomingEvents = await this.eventsRepository
            .createQueryBuilder('event')
            .where('event.eventDate >= :now', { now: new Date().toISOString().slice(0, 10) })
            .andWhere('event.isActive = :isActive', { isActive: true })
            .getCount();
        
        const pastEvents = await this.eventsRepository
            .createQueryBuilder('event')
            .where('event.eventDate < :now', { now: new Date().toISOString().slice(0, 10) })
            .andWhere('event.isActive = :isActive', { isActive: true })
            .getCount();

        return {
            totalEvents,
            activeEvents,
            upcomingEvents,
            pastEvents,
        };
    }

    // Search events by title or description
    async searchEvents(query: string, page: number = 1, limit: number = 10) {
        const qb = this.eventsRepository.createQueryBuilder('event');
        
        qb.where('event.isActive = :isActive', { isActive: true })
          .andWhere('(event.title ILIKE :query OR event.description ILIKE :query)', { 
              query: `%${query}%` 
          })
          .orderBy('event.eventDate', 'ASC')
          .skip((page - 1) * limit)
          .take(limit);

        const [events, total] = await qb.getManyAndCount();
        return {
            events,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
}