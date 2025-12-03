import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Alias para o tipo de documento completo
export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
    @Prop({ required: true })
    timestamp: string;

    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop({ required: true })
    temperature_c: number;

    @Prop()
    humidity_percent: number;

    @Prop()
    wind_speed_kmh: number;

    @Prop()
    weather_code: number;

    @Prop()
    precipitation_probability: number;

    @Prop({ default: "Desconhecida" })
    city: string;

    @Prop({ default: "Não Classificado" })
    condition: string;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Index para otimizar buscas por tempo
WeatherLogSchema.index({ timestamp: -1 });