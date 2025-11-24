// backend/src/insights/insights.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../weather/schemas/weather-log.schema'; // Ajuste o caminho conforme sua estrutura

@Injectable()
export class InsightsService {
    constructor(
        @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
    ) { }

    async generateWeatherInsight(): Promise<any> {
        // 1. Definir o período de análise (ex: últimas 24 horas)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1); // 24 horas atrás

        // 2. Consulta de agregação no MongoDB
        const aggregationResult = await this.weatherLogModel.aggregate([
            // Filtra logs recentes
            { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
            // Calcula as médias
            {
                $group: {
                    _id: null,
                    averageTemp: { $avg: '$temperature_c' },
                    averageHumidity: { $avg: '$humidity_percent' },
                    count: { $sum: 1 },
                },
            },
        ]);

        if (aggregationResult.length === 0) {
            return {
                insight: 'Dados insuficientes para gerar um insight de clima nas últimas 24h.',
                data: null,
            };
        }

        const { averageTemp, averageHumidity, count } = aggregationResult[0];
        const avgTemp = parseFloat(averageTemp.toFixed(1));
        const avgHumidity = parseFloat(averageHumidity.toFixed(0));

        // 3. Gerar a classificação/insight
        let tempClassification = 'temperaturas moderadas';
        if (avgTemp > 28) {
            tempClassification = 'calor intenso';
        } else if (avgTemp < 10) {
            tempClassification = 'frio significativo';
        }

        let humidityClassification = 'e a umidade está normal';
        if (avgHumidity > 80) {
            humidityClassification = 'com alta probabilidade de neblina ou chuva leve';
        } else if (avgHumidity < 40) {
            humidityClassification = 'com o ar muito seco';
        }

        const insightText = `Nos últimos ${count} registros, a região apresentou uma média de ${avgTemp}°C, indicando ${tempClassification}, ${humidityClassification}.`;

        return {
            averageTemperature: avgTemp,
            averageHumidity: avgHumidity,
            totalRecords: count,
            insight: insightText,
        };
    }
}
