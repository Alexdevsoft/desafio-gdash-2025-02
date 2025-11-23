// backend/src/weather/weather.controller.ts

import { Controller, Post, Body, Get, HttpStatus, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Controller('api/weather') // Rota base: /api/weather
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    /**
     * Endpoint POST /api/weather/logs
     * ESTE É O RECEPTOR DOS DADOS DO WORKER GO!
     */
    @Post('logs')
    @HttpCode(HttpStatus.CREATED) // Retorna 201 Created
    @UsePipes(new ValidationPipe({ whitelist: true })) // Garante que a validação DTO funcione
    async createLog(@Body() createLogDto: CreateWeatherLogDto) {
        // A validação do DTO garante que os dados estão no formato correto.
        const savedLog = await this.weatherService.create(createLogDto);
        console.log(`[NestJS] Log de clima salvo: ${savedLog.timestamp}`);
        return { message: 'Log de clima salvo com sucesso', id: savedLog.id };
    }

    /**
     * Endpoint GET /api/weather/logs (Para o frontend)
     */
    @Get('logs')
    async findAll() {
        return this.weatherService.findAll();
    }
}