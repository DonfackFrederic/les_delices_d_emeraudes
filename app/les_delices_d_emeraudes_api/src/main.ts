import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {rawBody: true});
  
  const allowedOrigins = (
    process.env.CORS_ORIGINS ?? 'http://localhost:4200'
  ).split(',');
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
