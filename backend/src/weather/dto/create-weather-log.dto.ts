import { IsNotEmpty, IsNumber, IsString, IsInt } from 'class-validator';

export class CreateWeatherLogDto {
    @IsNotEmpty()
    @IsString()
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

    @IsInt() // O Worker Go envia como int
    weather_code: number;

    @IsNumber()
    precipitation_probability: number;

    @IsString()
    @IsNotEmpty()
    city: string = "Desconhecida"; // Valor default para evitar erros

    @IsString()
    @IsNotEmpty()
    condition: string = "Não Classificado"; // Valor default para evitar erros
}