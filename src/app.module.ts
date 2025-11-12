import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsModule } from './missions/missions.module';

@Module({
    imports: [
      // Charge les variables d'environnement
      ConfigModule.forRoot({
        isGlobal: true, // rend les variables accessibles partout dans l'app
      }),

      // Configure la connexion à la base PostgreSQL
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        synchronize: true, // ⚠️ à désactiver en production !
        logging: true,
      }),
      MissionsModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
