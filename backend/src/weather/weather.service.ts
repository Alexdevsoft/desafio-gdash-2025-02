// backend/src/weather/weather.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { InsightData } from './interfaces/insight.interface';

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(WeatherLog.name)
        private weatherLogModel: Model<WeatherLogDocument>,
    ) { }

    // Usado pelo Worker Go para salvar novos logs
    async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
        const createdLog = new this.weatherLogModel(createWeatherLogDto);
        return createdLog.save();
    }

    // Usado pelo Frontend para a tabela de logs
    async findAll(): Promise<WeatherLog[]> {
        // Busca os últimos 100 registros, ordenados por timestamp decrescente
        return this.weatherLogModel.find().sort({ timestamp: -1 }).limit(100).exec();
    }

    async getInsights(): Promise<InsightData> {
        // Define o intervalo de tempo para análise (últimas 24 horas)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

        // Agregação no MongoDB para calcular médias
        const aggregationResult = await this.weatherLogModel.aggregate([
            // Filtra logs das últimas 24 horas
            {
                $match: {
                    timestamp: { $gte: twentyFourHoursAgo.toISOString() },
                },
            },
            // Calcula as médias
            {
                $group: {
                    _id: null,
                    averageTemperature: { $avg: '$temperature_c' },
                    averageHumidity: { $avg: '$humidity_percent' },
                    totalRecords: { $sum: 1 },
                },
            },
        ]).exec();

        // Extração e arredondamento dos resultados
        const data = aggregationResult[0] || {};

        const averageTemperature = parseFloat(data.averageTemperature?.toFixed(1) || '0.0');
        const averageHumidity = parseFloat(data.averageHumidity?.toFixed(0) || '0');
        const totalRecords = data.totalRecords || 0;

        // Geração do Insight (Lógica de Negócios)
        let insight = 'Dados insuficientes para gerar um insight de clima nas últimas 24h.';

        if (totalRecords > 0) {
            if (averageTemperature < 10) {
                insight = `Nos últimos ${totalRecords} registros, a região apresentou uma média de ${averageTemperature}°C, indicando frio significativo.`;
            } else if (averageTemperature > 28 && averageHumidity < 60) {
                insight = `Nos últimos ${totalRecords} registros, a região apresentou uma média de ${averageTemperature}°C com baixa umidade, indicando tempo seco e quente.`;
            } else if (averageHumidity > 90) {
                insight = `Nos últimos ${totalRecords} registros, a umidade média de ${averageHumidity}% sugere alta chance de neblina ou chuvisco.`;
            } else {
                insight = `Nos últimos ${totalRecords} registros, a média de ${averageTemperature}°C e umidade de ${averageHumidity}% indicam condições climáticas amenas e estáveis.`;
            }
        }


        // Retorna a estrutura que o frontend espera
        return {
            averageTemperature,
            averageHumidity,
            totalRecords,
            insight,
        };
    }
}