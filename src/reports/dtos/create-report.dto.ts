import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  price: number;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1900)
  @Max(2025)
  year: number;

  @IsLongitude()
  lng: number; // longitude

  @IsLatitude()
  lat: number; // latitude

  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;
}
