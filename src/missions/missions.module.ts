import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './mission.entity';
import { MissionController } from './mission.controller';
import { MissionsService } from './missions.service';
import { MissionsCleanupCron } from './cron/missions-cleanup.cron';

@Module({
  imports: [TypeOrmModule.forFeature([Mission])],
  controllers: [MissionController],
  providers: [
    MissionsService,
    MissionsCleanupCron
  ],
  exports: [MissionsService],
})
export class MissionsModule {}
