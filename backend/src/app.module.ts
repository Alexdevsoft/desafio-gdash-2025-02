// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('A variável de ambiente MONGODB_URI não está definida.');
  throw new Error('MONGODB_URI é obrigatória para conectar ao MongoDB.');
}

@Module({
  imports: [
    // Conecta ao MongoDB usando a variável de ambiente (agora forçamos a tipagem com `!`)
    MongooseModule.forRoot(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }