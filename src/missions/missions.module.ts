import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './mission.entity';
import { MissionController } from './mission.controller';
import { MissionsService } from './missions.service';
import { MissionsCleanupCron } from './cron/missions-cleanup.cron';
import { MissionsOverdueAlertCron } from './cron/missions-overdue-alert.cron';

@Module({
  imports: [TypeOrmModule.forFeature([Mission])],
  controllers: [MissionController],
  providers: [
    MissionsService,
    MissionsCleanupCron,
    MissionsOverdueAlertCron
  ],
  exports: [MissionsService],
})
export class MissionsModule {}
