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

  @Delete()
  async deleteAll(): Promise<void> {
    return await this.missionStepsService.deleteAll();
  }

  @Delete(':id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.missionStepsService.deleteById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() stepData: Partial<MissionStep>,
  ): Promise<MissionStep> {
    return await this.missionStepsService.updateById(id, stepData);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() stepData: Partial<MissionStep>,
  ): Promise<MissionStep> {
    return await this.missionStepsService.patchById(id, stepData);
  }
}
