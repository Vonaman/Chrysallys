import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionReport } from './mission-report.entity';
import { MissionStep } from '../mission-step/mission-step.entity';

@Injectable()
export class MissionReportsService {
  constructor(
    @InjectRepository(MissionReport)
    private readonly missionReportRepository: Repository<MissionReport>,
    @InjectRepository(MissionStep)
    private readonly missionStepRepository: Repository<MissionStep>,
  ) {}

  private extractMissionStepId(reportData: any): number | undefined {
    if (typeof reportData?.missionStepId === 'number')
      return reportData.missionStepId;
    if (typeof reportData?.missionStepId === 'string')
      return parseInt(reportData.missionStepId, 10);
    if (typeof reportData?.missionStep?.id === 'number')
      return reportData.missionStep.id;
    if (typeof reportData?.missionStep?.id === 'string')
      return parseInt(reportData.missionStep.id, 10);
    return undefined;
  }

  private validateCreatePayload(reportData: Partial<MissionReport>) {
    if (!reportData.details || reportData.details.trim() === '') {
      throw new BadRequestException('details obligatoire');
    }
    if (!reportData.agentRedacteur || reportData.agentRedacteur.trim() === '') {
      throw new BadRequestException('agentRedacteur obligatoire');
    }
  }

  private validateUpdatePayload(reportData: Partial<MissionReport>) {
    if (reportData.details !== undefined && reportData.details.trim() === '') {
      throw new BadRequestException('details ne peut pas être vide');
    }
    if (
      reportData.agentRedacteur !== undefined &&
      reportData.agentRedacteur.trim() === ''
    ) {
      throw new BadRequestException('agentRedacteur ne peut pas être vide');
    }
  }

  async create(
    reportData: Partial<MissionReport> & { missionStepId?: number },
  ): Promise<MissionReport> {
    this.validateCreatePayload(reportData);

    const missionStepId = this.extractMissionStepId(reportData);
    if (!missionStepId || Number.isNaN(missionStepId)) {
      throw new BadRequestException(
        'MissionReport doit être lié à une missionStep (missionStepId ou missionStep:{id})',
      );
    }

    const step = await this.missionStepRepository.findOneBy({
      id: missionStepId,
    });
    if (!step) {
      throw new NotFoundException(
        `MissionStep with id ${missionStepId} not found`,
      );
    }

    (reportData as any).missionStep = step;
    delete (reportData as any).missionStepId;

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
    reportData: Partial<MissionReport> & { missionStepId?: number },
  ): Promise<MissionReport> {
    const report = await this.missionReportRepository.findOne({
      where: { id },
      relations: ['missionStep'],
    });
    if (!report) {
      throw new NotFoundException(`MissionReport with id ${id} not found`);
    }

    this.validateUpdatePayload(reportData);

    // Si on change la step associée, on vérifie qu’elle existe
    const missionStepId = this.extractMissionStepId(reportData);
    if (missionStepId !== undefined) {
      if (!Number.isFinite(missionStepId)) {
        throw new BadRequestException('missionStepId invalide');
      }
      const step = await this.missionStepRepository.findOneBy({
        id: missionStepId,
      });
      if (!step) {
        throw new NotFoundException(
          `MissionStep with id ${missionStepId} not found`,
        );
      }
      (reportData as any).missionStep = step;
      delete (reportData as any).missionStepId;
    }

    Object.assign(report, reportData);
    return await this.missionReportRepository.save(report);
  }

  async patchById(
    id: number,
    reportData: Partial<MissionReport> & { missionStepId?: number },
  ): Promise<MissionReport> {
    return this.updateById(id, reportData);
  }
}
