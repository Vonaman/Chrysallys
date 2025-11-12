import { Injectable, NotFoundException } from '@nestjs/common';
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

  async deleteAll(): Promise<void> {
    await this.missionReportRepository.clear();
  }

  async deleteById(id: number): Promise<void> {
    const result = await this.missionReportRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`MissionReport with id ${id} not found`);
    }
  }

  async updateById(
    id: number,
    reportData: Partial<MissionReport>,
  ): Promise<MissionReport> {
    const report = await this.missionReportRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`MissionReport with id ${id} not found`);
    }
    Object.assign(report, reportData);
    return await this.missionReportRepository.save(report);
  }

  async patchById(
    id: number,
    reportData: Partial<MissionReport>,
  ): Promise<MissionReport> {
    return this.updateById(id, reportData);
  }
}
