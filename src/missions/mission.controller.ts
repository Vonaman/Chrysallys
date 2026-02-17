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
import { MissionsService } from './missions.service';
import { Mission } from './mission.entity';

@Controller('api/missions')
export class MissionController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  async create(@Body() missionData: Partial<Mission>) {
    return await this.missionsService.create(missionData);
  }

  @Get()
  async findAll(): Promise<Mission[]> {
    return await this.missionsService.findAll();
  }

  @Delete()
  async deleteAll(): Promise<void> {
    return await this.missionsService.deleteAll();
  }

  @Delete(':id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.missionsService.deleteById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() missionData: Partial<Mission>,
  ): Promise<Mission> {
    return await this.missionsService.updateById(id, missionData);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() missionData: Partial<Mission>,
  ): Promise<Mission> {
    return await this.missionsService.patchById(id, missionData);
  }
}
