// backend/src/weather/schemas/weather-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({
    timestamps: true, // Adiciona campos createdAt e updatedAt
    collection: 'weather_logs', // Nome da coleção no MongoDB
})
export class WeatherLog {
    @Prop({ required: true, type: String })
    timestamp: string; // Ex: '2025-11-20T17:00:00Z'

    @Prop({ required: true, type: Number })
    latitude: number;

    @Prop({ required: true, type: Number })
    longitude: number;

    @Prop({ required: true, type: Number })
    temperature_c: number;

    @Prop({ required: true, type: Number })
    humidity_percent: number;

    @Prop({ required: true, type: Number })
    wind_speed_kmh: number;

    @Prop({ required: true, type: Number })
    weather_code: number;

    @Prop({ required: true, type: Number })
    precipitation_probability: number;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);