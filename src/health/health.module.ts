import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { MissionsModule } from '../missions/missions.module';

@Module({
  imports: [TerminusModule, TypeOrmModule, MissionsModule],
  controllers: [HealthController],
})
export class HealthModule {}
