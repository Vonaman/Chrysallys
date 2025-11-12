import { Controller, Post, Body, Get } from '@nestjs/common';
import { MissionStepsService } from './mission-step.service';
import { MissionStep } from './mission-step.entity';

@Controller('mission-steps')
export class MissionStepController {
  constructor(private readonly missionStepsService: MissionStepsService) {}

  @Post()
  async create(@Body() stepData: Partial<MissionStep>) {
    return await this.missionStepsService.create(stepData);
  }

  @Get()
  async findAll(): Promise<MissionStep[]> {
    return await this.missionStepsService.findAll();
  }
}
