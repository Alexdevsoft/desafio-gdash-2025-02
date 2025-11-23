// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';

// Use um operador de coalescência nula (??) ou um || simples para garantir a string.
// Isso satisfaz o TypeScript ao garantir que o valor passado não será 'undefined'.
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fallbackdb';

@Module({
  imports: [
    // Conecta ao MongoDB usando a variável de ambiente (agora forçamos a tipagem com `!`)
    MongooseModule.forRoot(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }),
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }