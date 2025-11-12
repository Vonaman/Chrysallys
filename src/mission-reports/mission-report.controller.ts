import { Controller, Post, Body, Get } from '@nestjs/common';
import { MissionReportsService } from './mission-report.service';
import { MissionReport } from './mission-report.entity';

@Controller('mission-reports')
export class MissionReportController {
  constructor(private readonly missionReportsService: MissionReportsService) {}

  @Post()
  async create(@Body() reportData: Partial<MissionReport>) {
    return await this.missionReportsService.create(reportData);
  }

  @Get()
  async findAll(): Promise<MissionReport[]> {
    return await this.missionReportsService.findAll();
  }
}
