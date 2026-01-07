import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './mission.entity';

const MISSION_STATUTS = ['EN_COURS', 'ANNULE', 'TERMINE'] as const;
type MissionStatut = (typeof MISSION_STATUTS)[number];

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {}

  private normalizeStatut(statut?: string): MissionStatut | undefined {
    if (!statut) return undefined;
    const s = statut.trim().toUpperCase();

    // tolérance pour "terminée/terminee/termine"
    if (s === 'TERMINÉE' || s === 'TERMINEE') return 'TERMINE';
    if (s === 'TERMINÉ' || s === 'TERMINE') return 'TERMINE';

    // tolérance pour "annulée/annulee"
    if (s === 'ANNULÉE' || s === 'ANNULEE') return 'ANNULE';
    if (s === 'ANNULÉ' || s === 'ANNULE') return 'ANNULE';

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
      if (d2 < d1) {
        throw new BadRequestException('dateFin doit être >= dateDebut');
      }
    }
  }

  private validateCreatePayload(missionData: Partial<Mission>) {
    if (!missionData.titre || missionData.titre.trim() === '') {
      throw new BadRequestException('titre obligatoire');
    }
    if (!missionData.agentReferent || missionData.agentReferent.trim() === '') {
      throw new BadRequestException('agentReferent obligatoire');
    }

    const statut = this.normalizeStatut(missionData.statut);
    if (!statut) {
      throw new BadRequestException(
        `statut invalide (attendus: ${MISSION_STATUTS.join(', ')})`,
      );
    }

    this.validateDates(missionData.dateDebut, missionData.dateFin);
  }

  private validateUpdatePayload(missionData: Partial<Mission>) {
    if (missionData.titre !== undefined && missionData.titre.trim() === '') {
      throw new BadRequestException('titre ne peut pas être vide');
    }
    if (
      missionData.agentReferent !== undefined &&
      missionData.agentReferent.trim() === ''
    ) {
      throw new BadRequestException('agentReferent ne peut pas être vide');
    }

    if (missionData.statut !== undefined) {
      const statut = this.normalizeStatut(missionData.statut);
      if (!statut) {
        throw new BadRequestException(
          `statut invalide (attendus: ${MISSION_STATUTS.join(', ')})`,
        );
      }
      // On normalise le statut en base
      missionData.statut = statut;
    }

    this.validateDates(missionData.dateDebut, missionData.dateFin);
  }

  async create(missionData: Partial<Mission>): Promise<Mission> {
    this.validateCreatePayload(missionData);

    // normalisation statut
    missionData.statut = this.normalizeStatut(missionData.statut)!;

    const mission = this.missionRepository.create(missionData);
    return await this.missionRepository.save(mission);
  }

  async findAll(): Promise<Mission[]> {
    return await this.missionRepository.find();
  }

  async deleteAll(): Promise<void> {
    await this.missionRepository.clear();
  }

  async deleteById(id: number): Promise<void> {
    const result = await this.missionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }
  }

  async updateById(
    id: number,
    missionData: Partial<Mission>,
  ): Promise<Mission> {
    const mission = await this.missionRepository.findOneBy({ id });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }

    this.validateUpdatePayload(missionData);

    Object.assign(mission, missionData);
    return await this.missionRepository.save(mission);
  }

  async patchById(id: number, missionData: Partial<Mission>): Promise<Mission> {
    return this.updateById(id, missionData);
  }

  /**
   * Cron/maintenance: supprime les missions "ANNULE" ou "TERMINE"
   * dont dateFin est plus vieille que X jours.
   */
  async deleteOldCompletedMissions(days: number): Promise<number> {
    if (!Number.isFinite(days) || days <= 0) {
      throw new BadRequestException('days doit être un nombre > 0');
    }

    const result = await this.missionRepository
      .createQueryBuilder()
      .delete()
      .from(Mission)
      .where('statut IN (:...statuts)', { statuts: ['ANNULE', 'TERMINE'] })
      .andWhere(
        "dateFin IS NOT NULL AND dateFin < NOW() - (:days * INTERVAL '1 day')",
        {
          days,
        },
      )
      .execute();

    return result.affected || 0;
  }
}
