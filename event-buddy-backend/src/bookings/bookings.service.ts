import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './bookings.entity';
import { Event } from '../events/events.entity';
import { User } from '../users/users.entity';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async bookSeats(userId: number, eventId: number, seatsBooked: number): Promise<Booking> {
        // Validate seat count (1-4 seats per booking)
        if (seatsBooked < 1 || seatsBooked > 4) {
            throw new BadRequestException('You can only book between 1 and 4 seats');
        }

        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');

        // Check if event is in the past
        const today = new Date();
        const eventDate = new Date(event.eventDate);
        if (eventDate < today) {
            throw new BadRequestException('Cannot book seats for past events');
        }

        // Check if event is active
        if (!event.isActive) {
            throw new BadRequestException('Event is not available for booking');
        }

        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check if user already has a booking for this event
        const existingBooking = await this.bookingsRepository.findOne({
            where: { user: { id: userId }, event: { id: eventId } }
        });
        if (existingBooking) {
            //ekhane maximum booking upor base kore book korar option ta add korte hbe
            throw new BadRequestException('You already have a booking for this event');
        }

        // Check available seats using the new bookedSeats field
        if (event.bookedSeats + seatsBooked > event.capacity) {
            throw new BadRequestException(`Only ${event.availableSeats} seats available`);
        }

        const booking = this.bookingsRepository.create({
            user,
            event,
            seatsBooked,
        });

        const savedBooking = await this.bookingsRepository.save(booking);

        // Update the event's booked seats count
        await this.eventsRepository.update(eventId, {
            bookedSeats: event.bookedSeats + seatsBooked
        });

        return savedBooking;
    }

    async getUserBookings(userId: number): Promise<Booking[]> {
        return this.bookingsRepository.find({
            where: { user: { id: userId } },
            relations: ['event'],
            // order: { createdAt: 'DESC' }, // Uncomment if Booking has createdAt
        });
    }

    async cancelBooking(userId: number, bookingId: number): Promise<void> {
        const booking = await this.bookingsRepository.findOne({
            where: { id: bookingId, user: { id: userId } },
            relations: ['event']
        });
        if (!booking) throw new NotFoundException('Booking not found');

        // Update the event's booked seats count
        await this.eventsRepository.update(booking.event.id, {
            bookedSeats: booking.event.bookedSeats - booking.seatsBooked
        });

        await this.bookingsRepository.delete(bookingId);
    }

    //na thkle ki respnse korbe seta handle korte hbe
    async getAllBookings(): Promise<Booking[]> {
        return this.bookingsRepository.find({ relations: ['user', 'event'], order: { createdAt: 'DESC' } });
    }

    async adminCancelBooking(bookingId: number): Promise<void> {
        const booking = await this.bookingsRepository.findOne({
            where: { id: bookingId },
            relations: ['event']
        });
        if (!booking) throw new NotFoundException('Booking not found');

        // Update the event's booked seats count
        await this.eventsRepository.update(booking.event.id, {
            bookedSeats: booking.event.bookedSeats - booking.seatsBooked
        });

        await this.bookingsRepository.delete(bookingId);
    }

    async getUserBookingsPaginated(userId: number, page: number = 1, limit: number = 10) {
        const [bookings, total] = await this.bookingsRepository.findAndCount({
            where: { user: { id: userId } },
            relations: ['event'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: bookings,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async getAdminBookingsPaginated(page: number = 1, limit: number = 10) {
        const [bookings, total] = await this.bookingsRepository.findAndCount({
            relations: ['user', 'event'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            data: bookings,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }


}