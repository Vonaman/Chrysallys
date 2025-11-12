import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionReport } from './mission-report.entity';
import { MissionReportController } from './mission-report.controller';
import { MissionReportsService } from './mission-report.service';

@Module({
  imports: [TypeOrmModule.forFeature([MissionReport])],
  controllers: [MissionReportController],
  providers: [MissionReportsService],
  exports: [MissionReportsService],
})
export class MissionReportsModule {}
