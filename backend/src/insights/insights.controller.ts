// backend/src/insights/insights.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('api')
export class InsightsController {
    constructor(private readonly insightsService: InsightsService) { }

    @Get('weather/insights')
    async getInsight() {
        return this.insightsService.generateWeatherInsight();
    }
}
