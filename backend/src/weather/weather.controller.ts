// backend/src/weather/weather.controller.ts

import { Controller, Post, Body, Get, HttpStatus, HttpCode, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { InsightData } from '@/weather/interfaces/insight.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createLog(@Body() createLogDto: CreateWeatherLogDto) {
        return this.weatherService.create(createLogDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('logs')
    async findAllLogs() {
        return this.weatherService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('insights')
    async getInsights(): Promise<InsightData> {
        return this.weatherService.getInsights();
    }
}