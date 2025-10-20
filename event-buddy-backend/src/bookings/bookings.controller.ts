import {
    Controller, Post, Get, Delete, Body, Param, Req, UseGuards,
    Query, BadRequestException,
    InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookSeatsDto } from './dto/book-seats.dto';
import { BookingQueryDto } from './dto/booking-query.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post('new-booking')
    async bookSeats(@Req() req, @Body() bookSeatsDto: BookSeatsDto): Promise<{ message: string; booking: any }> {
        try {
            const userId = req.user.id;
            const booking = await this.bookingsService.bookSeats(userId, bookSeatsDto.eventId, bookSeatsDto.seats);
            return {
                message: 'Seats booked successfully',
                booking
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error booking seats:', error);
            throw new InternalServerErrorException('Failed to book seats');
        }
    }

    //kono bookings na thakle ki respnse korbe seta handle korte hbe
    @Get('all-bookings')
    async getUserBookings(@Req() req) {
        try {
            const userId = req.user.id;
            return await this.bookingsService.getUserBookings(userId);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw new InternalServerErrorException('Failed to fetch user bookings');
        }
    }

    @Delete('cancel-booking/:id')
    async cancelBooking(@Req() req, @Param('id') bookingId: string): Promise<{ message: string }> {
        try {
            const userId = req.user.id;
            const bookingIdNum = Number(bookingId);
            if (isNaN(bookingIdNum)) {
                throw new BadRequestException('Invalid booking ID');
            }

            await this.bookingsService.cancelBooking(userId, bookingIdNum);
            return { message: 'Booking cancelled successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error cancelling booking:', error);
            throw new InternalServerErrorException('Failed to cancel booking');
        }
    }

    // admin endpoints below

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Get('admin/all-bookings')
    async getAllBookings() {
        try {
            return await this.bookingsService.getAllBookings();
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            throw new InternalServerErrorException('Failed to fetch all bookings');
        }
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete('admin/cancel-booking/:id')
    async adminCancelBooking(@Param('id') bookingId: string): Promise<{ message: string }> {
        try {
            const bookingIdNum = Number(bookingId);
            if (isNaN(bookingIdNum)) {
                throw new BadRequestException('Invalid booking ID');
            }

            await this.bookingsService.adminCancelBooking(bookingIdNum);
            return { message: 'Booking cancelled by admin' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error cancelling booking by admin:', error);
            throw new InternalServerErrorException('Failed to cancel booking');
        }
    }

    @Get('paginated-bookings')
    async getUserBookingsPaginated(@Req() req, @Query() query: BookingQueryDto) {
        try {
            const userId = req.user.id;
            return await this.bookingsService.getUserBookingsPaginated(
                userId,
                query.page || 1,
                query.limit || 10
            );
        } catch (error) {
            console.error('Error fetching paginated user bookings:', error);
            throw new InternalServerErrorException('Failed to fetch user bookings');
        }
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Get('admin/paginated-bookings')
    async getAdminBookingsPaginated(@Query() query: BookingQueryDto) {
        try {
            return await this.bookingsService.getAdminBookingsPaginated(
                query.page || 1,
                query.limit || 10
            );
        } catch (error) {
            console.error('Error fetching paginated admin bookings:', error);
            throw new InternalServerErrorException('Failed to fetch admin bookings');
        }
    }
}