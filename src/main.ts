import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('DB Host:', process.env.POSTGRES_HOST);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// coucouc les ptits loups
// euh je sais plus à force
