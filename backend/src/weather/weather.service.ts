// backend/src/weather/weather.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(WeatherLog.name)
        private weatherLogModel: Model<WeatherLogDocument>,
    ) { }

    /**
     * Cria um novo registro de log de clima no MongoDB.
     * @param logData Os dados de clima brutos vindos do Worker Go.
     * @returns O documento salvo.
     */
    async create(logData: WeatherLog): Promise<WeatherLogDocument> {
        const createdLog = new this.weatherLogModel(logData);
        return createdLog.save();
    }

    /**
     * Retorna todos os logs de clima (para o dashboard inicial)
     */
    async findAll(): Promise<WeatherLogDocument[]> {
        return this.weatherLogModel.find().sort({ timestamp: -1 }).limit(100).exec();
    }
}