import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionStep } from './mission-step.entity';
import { Mission } from '../missions/mission.entity';

const STEP_STATUTS = ['EN_COURS', 'ANNULE', 'TERMINE'] as const;
type StepStatut = (typeof STEP_STATUTS)[number];

@Injectable()
export class MissionStepsService {
  constructor(
    @InjectRepository(MissionStep)
    private readonly missionStepRepository: Repository<MissionStep>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {}

  private normalizeStatut(statut?: string): StepStatut | undefined {
    if (!statut) return undefined;
    const s = statut.trim().toUpperCase();
    if (
      s === 'TERMINÉE' ||
      s === 'TERMINEE' ||
      s === 'TERMINE' ||
      s === 'TERMINÉ'
    )
      return 'TERMINE';
    if (s === 'ANNULÉE' || s === 'ANNULEE' || s === 'ANNULE' || s === 'ANNULÉ')
      return 'ANNULE';
    if (s === 'EN_COURS') return 'EN_COURS';
    return undefined;
  }

  private validateDates(dateDebut?: Date, dateFin?: Date) {
    if (dateDebut && Number.isNaN(new Date(dateDebut).getTime())) {
      throw new BadRequestException('dateDebut invalide');
    }
    if (dateFin && Number.isNaN(new Date(dateFin).getTime())) {
      throw new BadRequestException('dateFin invalide');
    }
    if (dateDebut && dateFin) {
      const d1 = new Date(dateDebut);
      const d2 = new Date(dateFin);
      if (d2 < d1)
        throw new BadRequestException('dateFin doit être >= dateDebut');
    }
  }

  private extractMissionId(stepData: any): number | undefined {
    if (typeof stepData?.missionId === 'number') return stepData.missionId;
    if (typeof stepData?.missionId === 'string')
      return parseInt(stepData.missionId, 10);
    if (typeof stepData?.mission?.id === 'number') return stepData.mission.id;
    if (typeof stepData?.mission?.id === 'string')
      return parseInt(stepData.mission.id, 10);
    return undefined;
  }

  private validateCreatePayload(stepData: Partial<MissionStep>) {
    if (!stepData.description || stepData.description.trim() === '') {
      throw new BadRequestException('description obligatoire');
    }
    if (!stepData.agentAssigne || stepData.agentAssigne.trim() === '') {
      throw new BadRequestException('agentAssigne obligatoire');
    }

    const statut = this.normalizeStatut(stepData.statut);
    if (!statut) {
      throw new BadRequestException(
        `statut invalide (attendus: ${STEP_STATUTS.join(', ')})`,
      );
    }

    this.validateDates(stepData.dateDebut, stepData.dateFin);
  }

  private validateUpdatePayload(stepData: Partial<MissionStep>) {
    if (
      stepData.description !== undefined &&
      stepData.description.trim() === ''
    ) {
      throw new BadRequestException('description ne peut pas être vide');
    }
    if (
      stepData.agentAssigne !== undefined &&
      stepData.agentAssigne.trim() === ''
    ) {
      throw new BadRequestException('agentAssigne ne peut pas être vide');
    }
    if (stepData.statut !== undefined) {
      const statut = this.normalizeStatut(stepData.statut);
      if (!statut) {
        throw new BadRequestException(
          `statut invalide (attendus: ${STEP_STATUTS.join(', ')})`,
        );
      }
      stepData.statut = statut;
    }

    this.validateDates(stepData.dateDebut, stepData.dateFin);
  }

  async create(
    stepData: Partial<MissionStep> & { missionId?: number },
  ): Promise<MissionStep> {
    this.validateCreatePayload(stepData);

    const missionId = this.extractMissionId(stepData);
    if (!missionId || Number.isNaN(missionId)) {
      throw new BadRequestException(
        'MissionStep doit être liée à une mission (missionId ou mission:{id})',
      );
    }

    const mission = await this.missionRepository.findOneBy({ id: missionId });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${missionId} not found`);
    }

    stepData.statut = this.normalizeStatut(stepData.statut)!;
    // On force la relation proprement
    (stepData as any).mission = mission;
    delete (stepData as any).missionId;

    const step = this.missionStepRepository.create(stepData);
    return await this.missionStepRepository.save(step);
  }

  async findAll(): Promise<MissionStep[]> {
    return await this.missionStepRepository.find({ relations: ['mission'] });
  }

  async deleteAll(): Promise<void> {
    await this.missionStepRepository.clear();
  }

  async deleteById(id: number): Promise<void> {
    const result = await this.missionStepRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`MissionStep with id ${id} not found`);
    }
  }

  async updateById(
    id: number,
    stepData: Partial<MissionStep> & { missionId?: number },
  ): Promise<MissionStep> {
    const step = await this.missionStepRepository.findOne({
      where: { id },
      relations: ['mission'],
    });
    if (!step) {
      throw new NotFoundException(`MissionStep with id ${id} not found`);
    }

    this.validateUpdatePayload(stepData);

    // Si on change la mission associée, on vérifie qu’elle existe
    const missionId = this.extractMissionId(stepData as any);
    if (missionId !== undefined) {
      if (!Number.isFinite(missionId)) {
        throw new BadRequestException('missionId invalide');
      }
      const mission = await this.missionRepository.findOneBy({ id: missionId });
      if (!mission) {
        throw new NotFoundException(`Mission with id ${missionId} not found`);
      }
      (stepData as any).mission = mission;
      delete (stepData as any).missionId;
    }

    Object.assign(step, stepData);
    return await this.missionStepRepository.save(step);
  }

  async patchById(
    id: number,
    stepData: Partial<MissionStep> & { missionId?: number },
  ): Promise<MissionStep> {
    return this.updateById(id, stepData);
  }
}
