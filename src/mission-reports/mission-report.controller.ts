import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Put,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { MissionReportsService } from './mission-report.service';
import { MissionReport } from './mission-report.entity';

@Controller('api/mission-reports')
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

  @Delete()
  async deleteAll(): Promise<void> {
    return await this.missionReportsService.deleteAll();
  }

  @Delete(':id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.missionReportsService.deleteById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() reportData: Partial<MissionReport>,
  ): Promise<MissionReport> {
    return await this.missionReportsService.updateById(id, reportData);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() reportData: Partial<MissionReport>,
  ): Promise<MissionReport> {
    return await this.missionReportsService.patchById(id, reportData);
  }
}
