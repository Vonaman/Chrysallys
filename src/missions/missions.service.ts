import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './mission.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) {}

  async create(missionData: Partial<Mission>): Promise<Mission> {
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

  async updateById(id: number, missionData: Partial<Mission>): Promise<Mission> {
    const mission = await this.missionRepository.findOneBy({ id });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }
    // For PUT: replace fields provided (this keeps unspecified fields as they are).
    Object.assign(mission, missionData);
    return await this.missionRepository.save(mission);
  }

  async patchById(id: number, missionData: Partial<Mission>): Promise<Mission> {
    // For PATCH we use the same logic as update (partial update)
    return this.updateById(id, missionData);
  }

async deleteOldCompletedMissions(days: number): Promise<number> {
  const result = await this.missionRepository
    .createQueryBuilder()
    .delete()
    .from(Mission)
    .where('statut = :statut', { statut: 'terminée' })
    .andWhere(
      'dateFin < NOW() - (:days * INTERVAL \'1 day\')',
      { days },
    )
    .execute();

  return result.affected || 0;
}

}
