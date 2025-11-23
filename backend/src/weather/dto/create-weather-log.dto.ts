// backend/src/weather/dto/create-weather-log.dto.ts

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// Usa DTOs para garantir a validação da requisição
export class CreateWeatherLogDto {
    @IsString()
    @IsNotEmpty()
    timestamp: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsNumber()
    temperature_c: number;

    @IsNumber()
    humidity_percent: number;

    @IsNumber()
    wind_speed_kmh: number;

    @IsNumber()
    weather_code: number;

    @IsNumber()
    precipitation_probability: number;
}