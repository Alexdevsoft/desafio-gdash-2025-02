// backend/src/insights/insights.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('api/insights') // Ou 'api/insights'
export class InsightsController {
    constructor(private readonly insightsService: InsightsService) { }

    @Get()
    async getInsight() {
        return this.insightsService.generateWeatherInsight();
    }
}
