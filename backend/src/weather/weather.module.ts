// backend/src/weather/weather.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),

    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'amq.topic',
          type: 'topic',
        },
      ],
      uri: `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService], // Exportamos o serviço se ele for usado por outros módulos (como o de IA)
})
export class WeatherModule { }