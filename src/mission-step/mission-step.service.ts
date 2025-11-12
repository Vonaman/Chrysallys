import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionStep } from './mission-step.entity';

@Injectable()
export class MissionStepsService {
  constructor(
    @InjectRepository(MissionStep)
    private readonly missionStepRepository: Repository<MissionStep>,
  ) {}

  async create(stepData: Partial<MissionStep>): Promise<MissionStep> {
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
    stepData: Partial<MissionStep>,
  ): Promise<MissionStep> {
    const step = await this.missionStepRepository.findOneBy({ id });
    if (!step) {
      throw new NotFoundException(`MissionStep with id ${id} not found`);
    }
    Object.assign(step, stepData);
    return await this.missionStepRepository.save(step);
  }

  async patchById(
    id: number,
    stepData: Partial<MissionStep>,
  ): Promise<MissionStep> {
    return this.updateById(id, stepData);
  }
}
