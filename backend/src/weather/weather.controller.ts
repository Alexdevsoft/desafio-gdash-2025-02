// backend/src/weather/weather.controller.ts

import { Controller, Post, Body, Get, HttpStatus, HttpCode, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
    @Get('logs')
    async findAllLogs() {
        return this.weatherService.findAll();
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin', 'User')
    @Get()
    async findAllLogsRoot() {
        return this.weatherService.findAll();
    }

    // 3. Rota de insights
    // O InsightsController cuida disso, mas se houvesse uma rota aqui, também precisaria do Guard.
    @Get('health')
    getWeatherControllerHealth() {
        return { status: 'OK', controller: 'WeatherController' };
    }
}