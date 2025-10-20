import { 
  UseInterceptors, 
  UploadedFile, 
  Controller, 
  Get, 
  Post, 
  Query, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Request, 
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { File } from 'multer';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto'; 



@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get('all')
  async findAll(): Promise<Event[]> {
    //console.log('Fetching all events');
    try {
      return await this.eventsService.findAll();
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      const event = await this.eventsService.findOne(eventId);
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      
      return event;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching event:', error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    //console.log('Creating event in controller:', createEventDto);
    try {
      return await this.eventsService.create(createEventDto);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      return await this.eventsService.update(eventId, updateEventDto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating event:', error);
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      await this.eventsService.remove(eventId);
      return { message: 'Event deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting event:', error);
      throw new InternalServerErrorException('Failed to delete event');
    }
  }


  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async register(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      await this.eventsService.registerUser(eventId, req.user);
      return { message: 'Successfully registered for event' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error registering for event:', error);
      throw new InternalServerErrorException('Failed to register for event');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      await this.eventsService.cancelRegistration(eventId, req.user);
      return { message: 'Successfully cancelled event registration' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error cancelling event registration:', error);
      throw new InternalServerErrorException('Failed to cancel event registration');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/my/registrations')
  async getMyRegistrations(@Request() req) {
    try {
      return await this.eventsService.getUserRegistrations(req.user);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw new InternalServerErrorException('Failed to fetch user registrations');
    }
  }


  @Get('pages/paginated')
  async getPaginatedEvents(@Query() query: EventQueryDto) {
    try {
      return await this.eventsService.getPaginatedEvents(
        query.page || 1, 
        query.limit || 10, 
        query.dateFilter
      );
    } catch (error) {
      console.error('Error fetching paginated events:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  @Get('search/query')
  async searchEvents(@Query() query: EventQueryDto) {
    //console.log('event query:', query);
    try {
      if (!query.q) {
        throw new BadRequestException('Search query is required');
      }
      return await this.eventsService.searchEvents(query.q, query.page || 1, query.limit || 10);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error searching events:', error);
      throw new InternalServerErrorException('Failed to search events');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/statistics')
  async getEventStatistics() {
    try {
      return await this.eventsService.getEventStatistics();
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      throw new InternalServerErrorException('Failed to fetch event statistics');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: File): Promise<{ imageUrl: string }> {
    try {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        throw new BadRequestException('Invalid event ID');
      }
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      const imageUrl = `/uploads/${file.filename}`;
      await this.eventsService.updateImage(eventId, imageUrl);
      return { imageUrl };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error uploading image:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  

}