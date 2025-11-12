import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionReport } from './mission-report.entity';

@Injectable()
export class MissionReportsService {
  constructor(
    @InjectRepository(MissionReport)
    private readonly missionReportRepository: Repository<MissionReport>,
  ) {}

  async create(reportData: Partial<MissionReport>): Promise<MissionReport> {
    const report = this.missionReportRepository.create(reportData);
    return await this.missionReportRepository.save(report);
  }

  async findAll(): Promise<MissionReport[]> {
    return await this.missionReportRepository.find({
      relations: ['missionStep'],
    });
  }
}
