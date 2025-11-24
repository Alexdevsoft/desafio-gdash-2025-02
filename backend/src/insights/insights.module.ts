// backend/src/insights/insights.module.ts
import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogSchema, WeatherLog } from '../weather/schemas/weather-log.schema'; // Ajuste o caminho

@Module({
  imports: [
    // Importa o Schema do log de clima para que o service possa acessá-lo
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule { }