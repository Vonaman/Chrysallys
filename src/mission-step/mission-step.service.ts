import { Injectable } from '@nestjs/common';
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
}
