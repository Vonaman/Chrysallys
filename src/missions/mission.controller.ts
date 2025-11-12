import { Controller, Post, Body } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { Mission } from './mission.entity';

@Controller('missions')
export class MissionController {
    constructor(private readonly missionsService: MissionsService) {}

    @Post()
    async create(@Body() missionData: Partial<Mission>) {
        return await this.missionsService.create(missionData);
    }
}
