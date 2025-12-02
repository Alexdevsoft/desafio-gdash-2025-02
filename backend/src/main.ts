import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*', // Idealmente, use 'http://localhost:5173' em vez de '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`[NestJS] Aplicação rodando em http://localhost:${port}/api`);
  });
}
bootstrap();
