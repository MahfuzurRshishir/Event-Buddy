import { IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class BookSeatsDto {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  seats: number;
}
