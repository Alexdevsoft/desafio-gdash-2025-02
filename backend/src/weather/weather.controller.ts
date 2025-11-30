// backend/src/weather/weather.controller.ts

import { Controller, Post, Body, Get, HttpStatus, HttpCode, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    @HttpCode(HttpStatus.CREATED) // Retorna 201 Created
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createLog(@Body() createLogDto: CreateWeatherLogDto) {
        // A validação do DTO garante que os dados estão no formato correto.
        const savedLog = await this.weatherService.create(createLogDto);
        console.log(`[NestJS] Log de clima salvo: ${savedLog.timestamp}`);
        return { message: 'Log de clima salvo com sucesso', id: savedLog.id };
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin', 'User')
    @Get('insights')
    async getInsights() {
        return {
            averageTemperature: 25,
            averageHumidity: 60,
            totalRecords: 100,
            insight: "Dados de teste carregados."
        };
    }
}